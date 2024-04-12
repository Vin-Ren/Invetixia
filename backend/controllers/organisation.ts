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
                createdTickets: {
                    include: {
                        invitation: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        const createdTicketCount = await prismaClient.ticket.count({
            where: { ownerAffiliationId: UUID as string }
        })

        return res.json({ organisation: { ...organisation, createdTicketCount } })
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

        await logEvent({ event: "CREATE", summary: `Create Organisation`, description: `Created organisation named=${organisation.name} [UUID=${organisation.UUID}]` })
        return res.json({ organisation })
    } catch (e) {
        console.log(e)
    }
}


// Post
export const createMany = async (req: Request, res: Response) => {
    const { names }: { names: string[] } = req.body
    if (!isAdmin(req.user)) return res.sendStatus(403)

    let permitted = 1;
    names.forEach((name) => {
        if (!name || typeof name !== 'string') permitted = 0
    })

    if (!permitted) return res.sendStatus(400)

    try {
        // const organisations = await prismaClient.organisation.createMany({
        //     data: names.map((name) => ({ name })),

        // });

        const organisations = await prismaClient.$transaction(
            names.map((name) => (
                prismaClient.organisation.create({ data: { name } })))
        )

        await logEvent({ event: "CREATE", summary: `Create Many Organisation`, description: `Created ${organisations.length} organisations named=${names} [UUIDs=${organisations.map((org) => org.UUID)}]` })
        return res.json({ organisations })
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

        await logEvent({ event: "UPDATE", summary: `Update Organisation`, description: `Updated organisation named=${newName} [UUID=${organisation.UUID}]` })
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

        await logEvent({ event: "DELETE", summary: `Delete Organisation`, description: `Deleted organisation named=${deletedOrganisation.name} [UUID=${UUID}]` })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteMany = async (req: Request, res: Response) => {
    const { UUIDs = [] }: { UUIDs: string[] } = req.body;
    if (!isAdmin(req.user)) return res.sendStatus(403)

    let permitted = true
    UUIDs.forEach(UUID => { permitted &&= (UUID != 'default') && (typeof UUID === "string") });

    if (!permitted) return res.sendStatus(403)

    try {
        const deletedOrganisations = await prismaClient.organisation.deleteMany({
            where: {
                UUID: { in: UUIDs }
            }
        })

        await logEvent({ event: "DELETE", summary: `Delete Organisations`, description: `Deleted organisations [UUIDs=${UUIDs}]` })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
