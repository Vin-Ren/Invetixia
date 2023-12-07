import { Request, Response } from "../types";
import { prismaClient } from "../services/database";
import { isAdmin, isOrganisationManager } from "../utils/permissionCheckers";


// Get
export const getAll = async (req: Request, res: Response) => {
    if (!isAdmin(req.user)) return res.sendStatus(403)

    try {
        const quotas = await prismaClient.quota.findMany({
            select: {
                UUID: true,
                quotaType: {
                    select: { name: true }
                },
                ticket: {
                    select: { ownerName: true }
                },
                usageLeft: true
            }
        });
        return res.json({ quotas })
    } catch (e) {
        console.log(e)
    }
}


// Get
// always public
export const getOne = async (req: Request, res: Response) => {
    const { UUID } = req.params

    try {
        const quota = await prismaClient.quota.findUniqueOrThrow({
            where: { UUID: UUID as string },
            include: {
                quotaType: true,
                ticket: true
            }
        });
        return res.json({ quota })
    } catch (e) {
        console.log(e)
        return res.sendStatus(404)
    }
}


// Post
export const create = async (req: Request, res: Response) => {
    const { quotaTypeId, usageLeft, ticketId } = req.body

    try {
        const { ownerAffiliationId } = await prismaClient.ticket.findUniqueOrThrow({
            where: { UUID: ticketId },
            select: { ownerAffiliationId: true }
        })
        if (!isOrganisationManager(req.user, ownerAffiliationId)) return res.sendStatus(403)

        const quota = await prismaClient.quota.create({
            data: {
                quotaTypeId: quotaTypeId,
                usageLeft: usageLeft,
                ticketId: ticketId
            }
        })
        return res.json({ quota })
    } catch (e) {
        console.log(e)
    }
}


// Post
export const consume = async (req: Request, res: Response) => {
    const { UUID } = req.body
    if (!UUID) return res.sendStatus(400)

    try {
        const { ticket } = await prismaClient.quota.findUniqueOrThrow({
            where: { UUID: UUID },
            select: {
                ticket: {
                    select: { ownerAffiliationId: true }
                }
            }
        })
        if (!isOrganisationManager(req.user, ticket.ownerAffiliationId)) return res.sendStatus(403)

        const consumedQuota = await prismaClient.quota.update({
            where: {
                UUID: UUID,
                usageLeft: { gt: 0 }
            },
            data: {
                usageLeft: {
                    decrement: 1
                }
            }
        })

        return res.json({ quota: consumedQuota })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, quotaTypeId, usageLeft } = req.body
    if (!UUID || !quotaTypeId || typeof usageLeft !== "number") return res.sendStatus(400)

    try {
        const { ticket } = await prismaClient.quota.findUniqueOrThrow({
            where: { UUID: UUID },
            select: {
                ticket: {
                    select: { ownerAffiliationId: true }
                }
            }
        })
        if (!isOrganisationManager(req.user, ticket.ownerAffiliationId)) return res.sendStatus(403)

        const updatedQuota = await prismaClient.quota.update({
            where: { UUID: UUID },
            data: {
                quotaTypeId: quotaTypeId,
                usageLeft: usageLeft
            }
        })

        return res.json({ quota: updatedQuota })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;

    try {
        const { ticket } = await prismaClient.quota.findUniqueOrThrow({
            where: { UUID: UUID },
            select: {
                ticket: {
                    select: { ownerAffiliationId: true }
                }
            }
        })
        if (!isOrganisationManager(req.user, ticket.ownerAffiliationId)) return res.sendStatus(403)

        const deletedQuota = await prismaClient.quota.delete({
            where: { UUID: UUID }
        })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
