import { DefaultTicketInput, Request, Response } from "../types";
import { prismaClient } from "../database";
import { isAdmin, isOrganisationManager } from "../utils/permissionCheckers";


// Get
export const getAll = async (req: Request, res: Response) => {
    if (!isAdmin(req.user)) return res.sendStatus(403)

    try {
        const invitations = await prismaClient.invitation.findMany({
            include: { publisher: { select: { name: true } } }
        });
        return res.json({ invitations })
    } catch (e) {
        console.log(e)
    }
}


// Get
export const getOne = async (req: Request, res: Response) => {
    const { UUID } = req.params
    const { limitTickets } = req.query
    
    try {
        const invitation = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID as string },
            include: {
                publisher: {
                    include: {
                        managers: {
                            orderBy: { role: 'desc' },
                            select: {
                                UUID: true,
                                username: true,
                                role: true
                            }
                        }
                    }
                },
                createdTickets: { // by default get 10 most recent tickets
                    take: -(parseInt(limitTickets as string) || 10)
                },
                defaults: true
            }
        });
        if (!isOrganisationManager(req.user, invitation.publisher.UUID)) return res.sendStatus(403)
        return res.json({ invitation })
    } catch (e) {
        console.log(e)
    }
}


// Get
export const getOnePublic = async (req: Request, res: Response) => {
    const { UUID } = req.params

    try {
        const invitation = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID as string },
            select: {
                name: true,
                publisher: {
                    select: { 
                        UUID: true,
                        name: true
                    }
                },
                usageLeft: true
            }
        });
        return res.json({ invitation })
    } catch (e) {
        console.log(e)
        return res.sendStatus(404)
    }
}


// Get
export const getTickets = async (req: Request, res: Response) => {
    const { UUID } = req.params
    
    try {
        const { organisationId, createdTickets } = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID as string },
            select: {
                organisationId: true,
                createdTickets: {
                    select: {
                        UUID: true,
                        ownerName: true,
                        ownerContacts: true,
                        ownerAffiliation: {
                            select: { name: true }
                        },
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
        if (!isOrganisationManager(req.user, organisationId)) return res.sendStatus(403)
        return res.json({ tickets: createdTickets })
    } catch (e) {
        console.log(e)
    }
}


// Get
export const getDefaults = async (req: Request, res: Response) => {
    const { UUID } = req.params
    
    try {
        const { organisationId, defaults } = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID as string },
            include: {
                defaults: {
                    include: { quotaType: true }
                }
            }
        });
        if (!isOrganisationManager(req.user, organisationId)) return res.sendStatus(403)
        return res.json({ defaults })
    } catch (e) {
        console.log(e)
    }
}



// Post
export const create = async (req: Request, res: Response) => {
    const {
        name, organisationId, usageQuota, defaults
    }: {
        name: string, organisationId: string, usageQuota: number, defaults: DefaultTicketInput[]
    } = req.body
    if (!organisationId) return res.sendStatus(400)
    if (!isOrganisationManager(req.user, organisationId)) res.sendStatus(403)

    try {
        if (typeof usageQuota !== "number") return res.sendStatus(400)
        defaults.forEach(element => { // prevents nested create
            if (typeof element.quotaTypeId !== "string") return res.sendStatus(400)
        });

        const invitation = await prismaClient.invitation.create({
            data: {
                name: name,
                organisationId: organisationId,
                usageQuota: usageQuota || 1,
                defaults: {
                    createMany: { data: defaults }
                }
            },
            include: {
                defaults: {
                    include: {
                        quotaType: {
                            select: { name: true }
                        }
                    }
                }
            }
        });
        return res.json({ invitation })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const {
        UUID, name, organisationId, newUsageQuota, newDefaults
    }: {
        UUID: string, name: string, organisationId: string, newUsageQuota: number, newDefaults: DefaultTicketInput[]
    } = req.body
    if (!name || !organisationId) return res.sendStatus(400)
    if (!isOrganisationManager(req.user, organisationId)) return res.sendStatus(403)

    try {
        if (typeof newUsageQuota !== "number") return res.sendStatus(400)
        const { organisationId: originalOrganisationId, usageQuota: originalUsageQuota } = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID },
            select: { organisationId: true, usageQuota: true }
        })
        if (organisationId !== originalOrganisationId && !isAdmin(req.user)) return res.sendStatus(403)

        newDefaults.forEach(element => { // prevents nested create
            if (typeof element.quotaTypeId !== "string") return res.sendStatus(400)
        });
        const createNewDefaults = prismaClient.defaultTicket.createMany({
            data: newDefaults.map((e) => { return { ...e, invitationId: UUID } })
        })

        const invitationTransaction = prismaClient.invitation.update({
            where: { UUID: UUID },
            data: {
                name: name,
                organisationId: organisationId,
                usageQuota: { increment: newUsageQuota-originalUsageQuota },
                usageLeft: { increment: newUsageQuota-originalUsageQuota }
            },
            include: {
                defaults: {
                    include: {
                        quotaType: { select: { name: true } }
                    }
                }
            }
        });

        const [_, invitation] = await prismaClient.$transaction([createNewDefaults, invitationTransaction])
        return res.json({ invitation })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;

    try {
        const { organisationId } = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID },
            select: { organisationId: true }
        })
        if (!isOrganisationManager(req.user, organisationId)) return res.sendStatus(403)

        const deletedInvitation = await prismaClient.invitation.delete({
            where: { UUID: UUID }
        })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
