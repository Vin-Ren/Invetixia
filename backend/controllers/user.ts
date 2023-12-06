import { env } from "process";
import { Request, Response } from "../types";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prismaClient, userRole } from "../database";

const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = env;


// Get
// can be accessed by everyone
export const getRoles = async (req: Request, res: Response) => {
    return res.json({ userRole });
}

// Get
export const getUsers = async (req: Request, res: Response) => {
    if (!req.user) return res.sendStatus(403)

    try {
        const { role } = await prismaClient.user.findFirstOrThrow({
            where: { UUID: req.user.UUID },
            select: { role: true }
        })

        const users = await prismaClient.user.findMany({
            where: { role: { lt: role } }, 
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationManaged: true
            }
        });
        return res.json({ users })
    } catch (e) {
        console.log(e)
    }
}


// Get
export const getUser = async (req: Request, res: Response) => {
    if (!req.user) return res.sendStatus(403)

    const { UUID } = req.query;

    try {
        const { role } = await prismaClient.user.findFirstOrThrow({
            where: { UUID: req.user.UUID },
            select: { role: true }
        })

        const user = await prismaClient.user.findFirstOrThrow({
            where: { UUID: UUID as string }, 
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationManaged: true
            }
        });
        if (user.role < userRole.ADMIN) return res.sendStatus(403)
        return res.json({ user })
    } catch (e) {
        console.log(e)
    }
}


// Post
// accounts are created by a super user.
export const create = async (req: Request, res: Response) => {

    const { username, password, role, organisationName } = req.body

    if (!req.user || req.user.role !== userRole.SUPER_ADMIN) return res.sendStatus(403)

    if (!username || !password || (password as string).length < 8 || !role || !organisationName) return res.sendStatus(400)

    try {
        const duplicateUser = await prismaClient.user.findFirst({
            where: { username: username }
        })
        if (duplicateUser) return res.sendStatus(400)

        const passwordHash = await bcrypt.hash(password, 10)

        const { UUID } = await prismaClient.user.create({
            data: {
                username: username,
                passwordHash: passwordHash,
                role: role,
                organisationManaged: {
                    connectOrCreate: {
                        where: { name: organisationName },
                        create: { name: organisationName },
                    }
                }
            },
            select: { UUID: true }
        })
        return res.json({ UUID, username, role })
    } catch (e) {
        console.log(e)
    }
}


// Post
export const login = async (req: Request, res: Response) => {
    if (req.user) return res.sendStatus(403)

    const { username, password } = req.body

    if (!username || !password) return res.sendStatus(400)

    try {
        const { UUID, passwordHash, role } = await prismaClient.user.findUniqueOrThrow({
            where: { username: username },
            select: {
                UUID: true,
                passwordHash: true,
                role: true
            }
        })
        const isMatch = await bcrypt.compare(password, passwordHash);
        if (!isMatch) return res.sendStatus(400);
        const refreshToken = jwt.sign({ UUID, username, role }, REFRESH_TOKEN_SECRET as string, {
            expiresIn: "1d"
        })
        const accessToken = jwt.sign({ UUID, username, role }, ACCESS_TOKEN_SECRET as string, {
            expiresIn: "15m"
        })

        const token = await prismaClient.user.update({
            where: { UUID: UUID },
            data: {
                tokens: {
                    upsert: {
                        update: {
                            access: accessToken, 
                            refresh: refreshToken
                        },
                        create: {
                            access: accessToken, 
                            refresh: refreshToken
                        }
                    }
                }
            }
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        res.json({ accessToken })
    } catch (e) {
        console.log(e)
        res.sendStatus(404)
    }
}


// Post
export const changePassword = async (req: Request, res: Response) => {
    if (!req.user) return res.sendStatus(403)

    const { password, newPassword } = req.body

    if ((!password && (req.user.role<userRole.ADMIN)) || !newPassword || (newPassword as string).length < 8) {
        return res.sendStatus(400)
    }

    try {
        const { UUID, username, role } = req.user;

        const { passwordHash } = await prismaClient.user.findUniqueOrThrow({
            where: { UUID: req.user.UUID },
            select: { passwordHash: true }
        })

        const isMatch = await bcrypt.compare(password, passwordHash);
        if (!isMatch && req.user.role<userRole.ADMIN) return res.sendStatus(400);

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        const refreshToken = jwt.sign({ UUID, username, role }, REFRESH_TOKEN_SECRET as string, {
            expiresIn: "1d"
        })
        const accessToken = jwt.sign({ UUID, username, role }, ACCESS_TOKEN_SECRET as string, {
            expiresIn: "5m"
        })

        const token = await prismaClient.user.update({
            where: {
                UUID: UUID,
                passwordHash: newPasswordHash
            },
            data: {
                tokens: {
                    upsert: {
                        update: {
                            access: accessToken, 
                            refresh: refreshToken
                        },
                        create: {
                            access: accessToken, 
                            refresh: refreshToken
                        }
                    }
                }
            }
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        res.json({ accessToken })
    } catch (e) {
        console.log(e)
        res.sendStatus(404)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, username, role, organisationName } = req.body

    if (!req.user || !username || req.user.role < userRole.ADMIN || req.user.role <= role) return res.sendStatus(403)

    if (!UUID || !role || !organisationName) return res.sendStatus(400)

    try {
        const user = await prismaClient.user.update({
            where: { UUID: UUID },
            data: {
                username: username,
                role: role,
                organisationManaged: {
                    connectOrCreate: {
                        where: { name: organisationName },
                        create: { name: organisationName }
                    }
                },
                tokens: { delete: true }
            }
        })
        return res.json({user})
    } catch (e) {
        console.log(e)
    }
}


// Post
export const logout = async (req: Request, res: Response) => {
    if (!req.user) return res.sendStatus(200)
    try {
        const user = await prismaClient.user.update({
            where: {
                UUID: req.user.UUID
            },
            data: {
                tokens: {
                    delete: true
                }
            }
        })
        res.clearCookie('refreshToken')
        return res.sendStatus(200)
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteUser = async (req: Request, res: Response) => {
    if (!req.user) return res.sendStatus(403)

    const { UUID } = req.params;

    try {
        const { role } = await prismaClient.user.findFirstOrThrow({
            where: { UUID: req.user.UUID },
            select: { role: true }
        })

        const user = await prismaClient.user.findFirstOrThrow({
            where: { UUID: UUID as string }, 
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationManaged: true
            }
        });
        if (user.role < userRole.ADMIN) return res.sendStatus(403)

        const deletedUser = await prismaClient.user.delete({
            where: { UUID: UUID }
        })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
