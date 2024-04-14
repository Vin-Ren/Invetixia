import { DefaultQuotaInput, Request, Response } from "../types";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../services/database";
import { isAdmin, isOrganisationManager } from "../utils/permissionCheckers";
import { logEvent } from "../utils/databaseLogging";


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
    const { UUID = "" } = req.params
    if (typeof UUID !== "string") return res.sendStatus(400)

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
                defaultQuotas: {
                    include: { quotaType: true }
                }
            }
        });
        if (!isOrganisationManager(req.user, invitation.publisher.UUID)) return res.sendStatus(403)

        const { _count: createdTicketCount } = await prismaClient.ticket.aggregate({
            where: { invitationId: UUID },
            _count: true
        })

        return res.json({ invitation: { ...invitation, createdTicketCount } })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return res.sendStatus(404)
        }
        console.log(e)
    }
}


// Get
export const getOnePublic = async (req: Request, res: Response) => {
    const { UUID } = req.params
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const invitation = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID as string },
            select: {
                UUID: true,
                name: true,
                publisher: {
                    select: {
                        UUID: true,
                        name: true
                    }
                },
                usageQuota: true,
                usageLeft: true
            }
        });

        return res.json({ invitation })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return res.sendStatus(404)
        }
        console.log(e)
    }
}


// Get
export const getTickets = async (req: Request, res: Response) => {
    const { UUID } = req.params
    if (typeof UUID !== "string") return res.sendStatus(400)

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
export const getDefaultQuotas = async (req: Request, res: Response) => {
    const { UUID } = req.params
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const { organisationId, defaultQuotas } = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID as string },
            include: {
                defaultQuotas: {
                    include: { quotaType: true }
                }
            }
        });

        if (!isOrganisationManager(req.user, organisationId)) return res.sendStatus(403)
        return res.json({ defaultQuotas })
    } catch (e) {
        console.log(e)
    }
}



// Post
export const create = async (req: Request, res: Response) => {
    const {
        name, organisationId, usageQuota = 1, defaultQuotas = []
    }: {
        name: string, organisationId: string, usageQuota: number, defaultQuotas: DefaultQuotaInput[]
    } = req.body
    if (!name || !organisationId) return res.sendStatus(400)
    if (!isOrganisationManager(req.user, organisationId)) return res.sendStatus(403)

    try {
        if (typeof usageQuota !== "number") return res.sendStatus(400)
        defaultQuotas.forEach(element => { // prevents nested create
            if (typeof element.quotaTypeId !== "string") return res.sendStatus(400)
        });

        const invitation = await prismaClient.invitation.create({
            data: {
                name: name,
                organisationId: organisationId,
                usageQuota: usageQuota,
                usageLeft: usageQuota,
                defaultQuotas: {
                    createMany: { data: defaultQuotas }
                }
            },
            include: {
                defaultQuotas: {
                    include: {
                        quotaType: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        await logEvent({ event: "CREATE", summary: `Create Invitation`, description: JSON.stringify(invitation) })
        return res.json({ invitation })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return res.sendStatus(500)
        }
        console.log(e)
        res.sendStatus(500)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const {
        UUID, name, organisationId, usageQuota, newDefaults = []
    }: {
        UUID: string, name: string, organisationId: string, usageQuota: number, newDefaults: DefaultQuotaInput[]
    } = req.body
    if (!isOrganisationManager(req.user, organisationId)) return res.sendStatus(403)
    if ((typeof UUID !== "string") || !name || !organisationId || !usageQuota) return res.sendStatus(400)

    try {
        if (typeof usageQuota !== "number") return res.sendStatus(400)
        const { organisationId: originalOrganisationId, usageQuota: originalUsageQuota, usageLeft: originalUsageLeft } = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID },
            select: { organisationId: true, usageQuota: true, usageLeft: true }
        })
        if (organisationId !== originalOrganisationId && !isAdmin(req.user)) return res.sendStatus(403)
        
        if (originalUsageQuota-usageQuota > originalUsageLeft) return res.sendStatus(400)

        newDefaults.forEach(element => { // prevents nested create
            if (typeof element.quotaTypeId !== "string") return res.sendStatus(400)
        });
        const createNewDefaults = prismaClient.defaultQuota.createMany({
            data: newDefaults.map((e) => { return { ...e, invitationId: UUID } })
        })

        const invitationTransaction = prismaClient.invitation.update({
            where: { UUID: UUID },
            data: {
                name: name,
                organisationId: organisationId,
                usageQuota: { increment: usageQuota - originalUsageQuota },
                usageLeft: { increment: usageQuota - originalUsageQuota }
            },
            include: {
                defaultQuotas: {
                    include: {
                        quotaType: { select: { name: true } }
                    }
                }
            }
        });

        const getCreatedTicketCount = prismaClient.ticket.aggregate({
            where: { invitationId: UUID },
            _count: true
        })

        const [_, invitation, { _count: createdTicketCount }] = await prismaClient.$transaction([createNewDefaults, invitationTransaction, getCreatedTicketCount])

        await logEvent({ event: "UPDATE", summary: `Update Invitation`, description: JSON.stringify(invitation) })
        return res.json({ invitation: { ...invitation, createdTicketCount } })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const { organisationId } = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: UUID },
            select: { organisationId: true }
        })
        if (!isOrganisationManager(req.user, organisationId)) return res.sendStatus(403)

        const deletedInvitation = await prismaClient.invitation.delete({
            where: { UUID: UUID }
        })

        await logEvent({ event: "DELETE", summary: `Delete Invitation`, description: JSON.stringify(deletedInvitation) })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
