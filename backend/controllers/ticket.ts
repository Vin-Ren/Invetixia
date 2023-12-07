import { DefaultTicketInput, Request, Response } from "../types";
import { prismaClient } from "../database";
import { isAdmin, isOrganisationManager } from "../utils/permissionCheckers";


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

    try {
        const invitation = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: invitationId },
            select: {
                usageLeft: true,
                organisationId: true
            }
        })

        if (invitation.usageLeft === 0) return res.json(404)

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
                ownerAffiliationId: invitation.organisationId
            }
        })

        const [_, ticket] = await prismaClient.$transaction([
            updateInvitation,
            createTicket
        ])

        return res.json({ ticket })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, ownerName, ownerContacts }: { UUID: string, ownerName: string, ownerContacts: string[] } = req.body
    if (!UUID || !ownerName || !ownerContacts) return res.sendStatus(400)

    try {
        if (typeof ownerName !== "string") return res.sendStatus(400)
        ownerContacts.forEach(e => {
            if (typeof e !== "string") return res.sendStatus(400)
        });

        const updatedTicket = await prismaClient.ticket.update({
            where: { UUID:UUID },
            data: {
                ownerName: ownerName,
                ownerContacts: ownerContacts
            }
        })

        return res.json({ ticket: updatedTicket })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;

    try {
        const { ownerAffiliationId } = await prismaClient.ticket.findUniqueOrThrow({
            where: { UUID: UUID },
            select: { ownerAffiliationId: true }
        })
        if (!isOrganisationManager(req.user, ownerAffiliationId)) return res.sendStatus(403)

        const deletedTicket = await prismaClient.ticket.delete({
            where: { UUID: UUID }
        })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
