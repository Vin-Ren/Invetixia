import { Request, Response, User } from "../types";
import { prismaClient, userRole } from "../database";


// Get
export const getAll = async (req: Request, res: Response) => {
    if (!req.user || req.user.role < userRole.ADMIN) return res.sendStatus(403)

    try {
        const organisations = await prismaClient.organisation.findMany({
            select: {
                UUID: true,
                name: true,
                managers: { // get highest roled manager
                    orderBy: { role: 'desc' },
                    take: 1,
                    select: {
                        UUID: true,
                        username: true,
                        role: true
                    }
                }
            }
        });
        return res.json({ organisations })
    } catch (e) {
        console.log(e)
    }
}


const isManagerOfOrganisation = (user: User|undefined, organisationId: string) => {
    return user && (!(user.role < userRole.ORGANISATION_MANAGER))
        && ((user.role >= userRole.ADMIN) || user.organisationId === organisationId);
}


// Get
export const getOne = async (req: Request, res: Response) => {
    const { UUID } = req.params
    const { limitTickets } = req.query
    if (!isManagerOfOrganisation(req.user, UUID)) return res.sendStatus(403)

    try {
        const organisation = await prismaClient.organisation.findFirstOrThrow({
            where: {
                UUID: UUID as string,
                managers: 
            },
            include: {
                managers: {
                    orderBy: { role: 'desc' },
                    select: {
                        UUID: true,
                        username: true,
                        role: true
                    }
                },
                publishedInvitations: true,
                createdTickets: { // by default get 10 most recent tickets
                    take: -(parseInt(limitTickets as string) || 10)
                }
            }
        });
        return res.json({ organisation })
    } catch (e) {
        console.log(e)
    }
}


// Get
export const getManagers = async (req: Request, res: Response) => {
    const { UUID } = req.params
    if (!isManagerOfOrganisation(req.user, UUID)) return res.sendStatus(403)

    try {
        const { managers } = await prismaClient.organisation.findFirstOrThrow({
            where: { UUID: UUID as string },
            select: {
                managers: {
                    select: {
                        UUID: true,
                        username: true,
                        role: true
                    }
                }
            }
        });
        return res.json({ managers })
    } catch (e) {
        console.log(e)
    }
}


// Get
export const getInvitations = async (req: Request, res: Response) => {
    const { UUID } = req.params
    const { onlyUsables } = req.query
    if (!isManagerOfOrganisation(req.user, UUID)) return res.sendStatus(403)

    try {
        const { publishedInvitations } = await prismaClient.organisation.findFirstOrThrow({
            where: { UUID: UUID as string },
            select: {
                publishedInvitations: {
                    select: {
                        UUID: true,
                        usageLeft: true,
                        createdTickets: true,
                        createdTime: true
                    }
                }
            }
        });
        if (onlyUsables) {
            return res.json({ invitations: publishedInvitations.filter((invitation) => (invitation.usageLeft > 0)) })
        }
        return res.json({ invitations: publishedInvitations })
    } catch (e) {
        console.log(e)
    }
}


// Get
export const getTickets = async (req: Request, res: Response) => {
    const { UUID } = req.params
    if (!isManagerOfOrganisation(req.user, UUID)) return res.sendStatus(403)

    try {
        const { createdTickets } = await prismaClient.organisation.findFirstOrThrow({
            where: { UUID: UUID as string },
            select: {
                createdTickets: {
                    select: {
                        UUID: true,
                        ownerName: true,
                        ownerContacts: true,
                        quotas: {
                            include: {
                                quotaType: {
                                    select: { name: true }
                                }
                            }
                        },
                        createdTime: true
                    }
                }
            }
        });
        return res.json({ tickets: createdTickets })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const create = async (req: Request, res: Response) => {
    if (!req.user || req.user.role < userRole.ADMIN) return res.sendStatus(403)

    const { name } = req.body
    if (!name) return res.sendStatus(400)

    try {
        const organisation = await prismaClient.organisation.create({
            data: { name: name }
        });
        return res.json({ organisation })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    if (!req.user || req.user.role < userRole.ADMIN) return res.sendStatus(403)

    const { UUID, newName } = req.body
    if (!newName) return res.sendStatus(400)

    try {
        const organisation = await prismaClient.organisation.update({
            where: { UUID: UUID },
            data: { name: newName },
            select: {
                UUID: true,
                name: true,
                managers: {
                    select: {
                        UUID: true,
                        username: true,
                        role: true
                    }
                }
            }
        });
        return res.json({ organisation })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    if (!req.user || req.user.role < userRole.ADMIN) return res.sendStatus(403)

    const { UUID } = req.body;

    try {
        const deletedOrganisation = await prismaClient.organisation.delete({
            where: { UUID: UUID }
        })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
