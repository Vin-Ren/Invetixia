import { Request, Response } from "../types";
import { prismaClient } from "../services/database";
import { isAdmin, isOrganisationManager } from "../utils/permissionCheckers";
import { logEvent } from "../utils/databaseLogging";


// Get
export const getAll = async (req: Request, res: Response) => {
    if (!isAdmin(req.user)) return res.sendStatus(403)

    try {
        const tickets = await prismaClient.ticket.findMany({
            include: {
                ownerAffiliation: {
                    select: { name: true }
                },
                invitation: {
                    select: { name: true }
                }
            }
        });

        return res.json({ tickets })
    } catch (e) {
        console.log(e)
    }
}


// Get
// always public
export const getOne = async (req: Request, res: Response) => {
    const { UUID } = req.params
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const ticket = await prismaClient.ticket.findUniqueOrThrow({
            where: { UUID: UUID as string },
            include: {
                ownerAffiliation: {
                    select: { name: true }
                },
                invitation: {
                    select: { name: true }
                },
                quotas: {
                    select: {
                        UUID: true,
                        quotaType: {
                            select: { name: true }
                        },
                        usageLeft: true
                    }
                }
            }
        });

        return res.json({ ticket })
    } catch (e) {
        console.log(e)
        return res.sendStatus(404)
    }
}


// Post
export const create = async (req: Request, res: Response) => {
    const { ownerName, ownerContacts, invitationId } = req.body
    if (!ownerName || !ownerContacts || !invitationId) return res.sendStatus(400)

    try {
        const invitation = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: invitationId },
            select: {
                usageLeft: true,
                organisationId: true,
                defaults: {
                    select: {
                        quotaTypeId: true,
                        value: true
                    }
                }
            }
        })

        if (invitation.usageLeft === 0) return res.json(403)

        const updateInvitation = prismaClient.invitation.update({
            where: {
                UUID: invitationId,
                usageLeft: { gt: 0 }
            },
            data: {
                usageLeft: { decrement: 1 }
            }
        })

        const createTicket = prismaClient.ticket.create({
            data: {
                ownerName: ownerName,
                ownerContacts: ownerContacts,
                invitationId: invitationId,
                ownerAffiliationId: invitation.organisationId,
                quotas: {
                    createMany: {
                        data: invitation.defaults.map((e) => { return { quotaTypeId: e.quotaTypeId, usageLeft: e.value } })
                    }
                }
            }
        })

        const [consumedInvitation, ticket] = await prismaClient.$transaction([
            updateInvitation,
            createTicket
        ])

        await logEvent({ event: "CONSUME", summary: `Consume Invitation`, description: JSON.stringify(consumedInvitation) })
        await logEvent({ event: "CREATE", summary: `Create Ticket`, description: JSON.stringify(ticket) })
        return res.json({ ticket })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, ownerName, ownerContacts }: { UUID: string, ownerName: string, ownerContacts: string[] } = req.body
    if ((typeof UUID !== "string") || !ownerName || !ownerContacts) return res.sendStatus(400)

    try {
        if (typeof ownerName !== "string") return res.sendStatus(400)
        ownerContacts.forEach(e => {
            if (typeof e !== "string") return res.sendStatus(400)
        });

        const updatedTicket = await prismaClient.ticket.update({
            where: { UUID: UUID },
            data: {
                ownerName: ownerName,
                ownerContacts: ownerContacts
            }
        })

        await logEvent({ event: "UPDATE", summary: `Update Ticket`, description: JSON.stringify(updatedTicket) })
        return res.json({ ticket: updatedTicket })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const { ownerAffiliationId, invitationId } = await prismaClient.ticket.findUniqueOrThrow({
            where: { UUID: UUID },
            select: {
                ownerAffiliationId: true,
                invitationId: true
            }
        })
        if (!isOrganisationManager(req.user, ownerAffiliationId)) return res.sendStatus(403)

        const deleteTicket = prismaClient.ticket.delete({
            where: { UUID: UUID }
        })
        const restoreInvitationUsage = prismaClient.invitation.update({
            where: { UUID: invitationId },
            data: {
                usageLeft: { increment: 1 }
            }
        })

        const [deletedTicket, restoredInvitation] = await prismaClient.$transaction([
            deleteTicket,
            restoreInvitationUsage
        ])

        await logEvent({ event: "DELETE", summary: `Delete Ticket`, description: JSON.stringify(deletedTicket) })
        await logEvent({ event: "RESTORE", summary: `Restore Invitation`, description: JSON.stringify(restoredInvitation) })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
