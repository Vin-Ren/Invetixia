import { env } from "process";
import { Request, Response } from "../types";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prismaClient, userRole } from "../services/database";
import { logEvent } from "../utils/databaseLogging";
import { isAdmin } from "../utils/permissionCheckers";
import { Prisma } from "@prisma/client";

const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_LIFETIME, ACCESS_TOKEN_LIFETIME, ACCESS_TOKEN_LIFETIME_AFTER_LOGIN } = env;


// Get
// can be accessed by everyone
export const getRoles = async (req: Request, res: Response) => {
    return res.json({ userRole });
}

// Get
export const getAll = async (req: Request, res: Response) => {
    if (!req.user || req.user.role < userRole.ADMIN) return res.sendStatus(403)

    try {
        const { role } = await prismaClient.user.findUniqueOrThrow({
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
export const getOne = async (req: Request, res: Response) => {
    const { UUID } = req.params;
    if (!req.user) return res.sendStatus(403)
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const user = await prismaClient.user.findUniqueOrThrow({
            where: { UUID: UUID as string },
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationManaged: true
            }
        });
        if (req.user.role < userRole.ADMIN) return res.sendStatus(403)

        return res.json({ user })
    } catch (e) {
        console.log(e)
    }
}


// Get
export const getSelf = async (req: Request, res: Response) => {
    if (!req.user) return res.sendStatus(403)

    try {
        const user = await prismaClient.user.findUniqueOrThrow({
            where: { UUID: req.user.UUID as string },
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationManaged: true
            }
        });
        return res.json({ user })
    } catch (e) {
        console.log(e)
    }
}


// Post
// accounts are created by a super user.
export const create = async (req: Request, res: Response) => {
    const { username, password, role, organisationName } = req.body
    if (!isAdmin(req.user)) return res.sendStatus(403)
    if (!username || !password || (password as string).length < 8 || !role || !organisationName) return res.sendStatus(400)
    if (req.user && req.user.role <= role) return res.sendStatus(403)

    try {
        const duplicateUser = await prismaClient.user.findUnique({
            where: { username: username }
        })
        if (duplicateUser) return res.sendStatus(400)

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prismaClient.user.create({
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
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationId: true
            }
        })

        await logEvent({ event: "CREATE", summary: `Create User`, description: `Created user '${user.username}' with role=${user.role} and organisation '${user.organisationId}'` })
        return res.json({ user })
    } catch (e) {
        console.log(e)
    }
}


// Post
export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body
    if (req.user) return res.sendStatus(403)
    if (!username || !password) return res.sendStatus(400)

    try {
        const { UUID, passwordHash, role, organisationId } = await prismaClient.user.findUniqueOrThrow({
            where: { username: username },
            select: {
                UUID: true,
                passwordHash: true,
                role: true,
                organisationId: true
            }
        })
        const isMatch = await bcrypt.compare(password, passwordHash);
        if (!isMatch) return res.sendStatus(401);
        const refreshToken = jwt.sign({ UUID, username, role, organisationId }, REFRESH_TOKEN_SECRET as string, {
            expiresIn: REFRESH_TOKEN_LIFETIME
        })
        const accessToken = jwt.sign({ UUID, username, role, organisationId, recentlyLoggedIn: true }, ACCESS_TOKEN_SECRET as string, {
            expiresIn: ACCESS_TOKEN_LIFETIME_AFTER_LOGIN
        })

        const _ = await prismaClient.user.update({
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

        await logEvent({ event: "UPDATE", summary: `Update UserToken`, description: `Login ${username}` })
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
export const changePassword = async (req: Request, res: Response) => {
    const { password = "", newPassword } = req.body
    if (!req.user) return res.sendStatus(403)
    if (!password || !newPassword || (newPassword as string).length < 8) {
        return res.sendStatus(400)
    }

    try {
        const { UUID, username, role, organisationId } = req.user;

        const { passwordHash } = await prismaClient.user.findUniqueOrThrow({
            where: { UUID: req.user.UUID },
            select: { passwordHash: true }
        })

        const isMatch = await bcrypt.compare(password, passwordHash);
        if (!isMatch && req.user.role < userRole.ADMIN) return res.sendStatus(400);

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        const refreshToken = jwt.sign({ UUID, username, role }, REFRESH_TOKEN_SECRET as string, {
            expiresIn: REFRESH_TOKEN_LIFETIME
        })
        const accessToken = jwt.sign({ UUID, username, role, organisationId }, ACCESS_TOKEN_SECRET as string, {
            expiresIn: ACCESS_TOKEN_LIFETIME
        })

        const user = await prismaClient.user.update({
            where: {
                UUID: UUID
            },
            data: {
                passwordHash: newPasswordHash,
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
            },
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationId: true
            }
        })

        await logEvent({ event: "UPDATE", summary: `Update User Password`, description: `Changed password for ${user.username}` })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        res.json({ accessToken })
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, username, role, organisationName, password = "" } = req.body
    if (!req.user || !username || req.user.role < userRole.ADMIN || req.user.role <= role) return res.sendStatus(403)
    if ((typeof UUID !== "string") || !username || !role || !organisationName || (password && password.length < 8)) return res.sendStatus(400)

    try {
        const originalUser = await prismaClient.user.findUniqueOrThrow({
            where: { UUID: UUID }
        })
        if (originalUser.role >= req.user.role) return res.sendStatus(403)

        const newPasswordHash = (password) ? (await bcrypt.hash(password, 10)) : originalUser.passwordHash;

        const user = await prismaClient.user.update({
            where: { UUID: UUID },
            data: {
                username: username,
                role: role,
                passwordHash: newPasswordHash,
                organisationManaged: {
                    connectOrCreate: {
                        where: { name: organisationName },
                        create: { name: organisationName }
                    }
                }
            },
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationManaged: true
            }
        })

        const tokens = await prismaClient.tokens.findUnique({
            where: { userId: UUID }
        })

        if (tokens) {
            const _ = await prismaClient.tokens.delete({
                where: { userId: UUID }
            })
        }

        await logEvent({ event: "UPDATE", summary: `Update User`, description: `Updated user ${user.username}` })
        return res.json({ user })
    } catch (e) {
        console.log(e)
    }
}


// Post
export const logout = async (req: Request, res: Response) => {
    if (!req.user) return res.sendStatus(200)

    try {
        const user = await prismaClient.user.findUnique({
            where: {
                UUID: req.user.UUID
            },
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationId: true
            }
        })

        if (!user) return res.sendStatus(404)

        const tokens = await prismaClient.tokens.findUnique({
            where: { userId: req.user.UUID }
        })
        
        if (tokens) {
            const _ = await prismaClient.tokens.delete({
                where: { userId: req.user.UUID }
            })
        }

        await logEvent({ event: "DELETE", summary: `Delete UserToken`, description: `Logout ${user.username}` })
        res.clearCookie('refreshToken')
        return res.sendStatus(200)
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;
    if (!req.user) return res.sendStatus(403)
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const user = await prismaClient.user.findUniqueOrThrow({
            where: { UUID: UUID },
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationManaged: true
            }
        });
        if (user.role === userRole.SUPER_ADMIN || req.user.role <= user.role) return res.sendStatus(403)

        const deletedUser = await prismaClient.user.delete({
            where: { UUID: UUID },
            select: {
                UUID: true,
                username: true,
                role: true,
                organisationId: true
            }
        })

        await logEvent({ event: "DELETE", summary: `Delete User`, description: `Deleted user ${user.username}` })
        return res.sendStatus(201)
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return res.sendStatus(404)
        } else {
            console.log(e)
        }
    }
}
