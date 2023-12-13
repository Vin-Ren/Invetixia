import { Request, Response } from "../types";
import { prismaClient } from "../services/database";
import { isAdmin, isOrganisationManager } from "../utils/permissionCheckers";
import { logEvent } from "../utils/databaseLogging";


// Get
export const getAll = async (req: Request, res: Response) => {
    if (!isAdmin(req.user)) return res.sendStatus(403)

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


// Get
export const getOne = async (req: Request, res: Response) => {
    const { UUID } = req.params
    const { limitTickets } = req.query
    if (!isOrganisationManager(req.user, UUID)) return res.sendStatus(403)
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const organisation = await prismaClient.organisation.findUniqueOrThrow({
            where: { UUID: UUID as string },
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
    if (!isOrganisationManager(req.user, UUID)) return res.sendStatus(403)
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const { managers } = await prismaClient.organisation.findUniqueOrThrow({
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
    if (!isOrganisationManager(req.user, UUID)) return res.sendStatus(403)
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const { publishedInvitations } = await prismaClient.organisation.findUniqueOrThrow({
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
    if (!isOrganisationManager(req.user, UUID)) return res.sendStatus(403)
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const { createdTickets } = await prismaClient.organisation.findUniqueOrThrow({
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


// Post
export const create = async (req: Request, res: Response) => {
    const { name } = req.body
    if (!isAdmin(req.user)) return res.sendStatus(403)
    if (!name || typeof name !== 'string') return res.sendStatus(400)

    try {
        const organisation = await prismaClient.organisation.create({
            data: { name: name }
        });

        await logEvent({ event: "CREATE", summary: `Create Organisation`, description: JSON.stringify(organisation) })
        return res.json({ organisation })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, newName } = req.body
    if (!isAdmin(req.user)) return res.sendStatus(403)
    if ((typeof UUID !== "string") || !newName) return res.sendStatus(400)

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

        await logEvent({ event: "UPDATE", summary: `Update Organisation`, description: JSON.stringify(organisation) })
        return res.json({ organisation })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;
    if (!isAdmin(req.user) || UUID === 'default') return res.sendStatus(403)
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const deletedOrganisation = await prismaClient.organisation.delete({
            where: { UUID: UUID }
        })

        await logEvent({ event: "DELETE", summary: `Delete Organisation`, description: JSON.stringify(deletedOrganisation) })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
