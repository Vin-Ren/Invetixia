import { Request, Response } from "../types";
import { prismaClient } from "../services/database";
import { isAdmin } from "../utils/permissionCheckers";
import { logEvent } from "../utils/databaseLogging";


// Get
export const getAll = async (req: Request, res: Response) => {
    if (!isAdmin(req.user)) return res.sendStatus(403)

    try {
        const quotaTypes = await prismaClient.quotaType.findMany({})
        return res.json({ quotaTypes })
    } catch (e) {
        console.log(e)
    }
}


// Get
export const getOne = async (req: Request, res: Response) => {
    const { UUID } = req.params
    if (!isAdmin(req.user)) return res.sendStatus(403)
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const quotaType = await prismaClient.quotaType.findUnique({
            where: { UUID: UUID },
            include: {
                quotas: {
                    select: {
                        UUID: true,
                        ticket: {
                            select: { ownerName: true }
                        },
                        usageLeft: true
                    }
                },
                defaultTickets: true
            }
        })

        return res.json({ quotaType })
    } catch (e) {
        console.log(e)
    }
}


// Post
export const create = async (req: Request, res: Response) => {
    const { name, description = "" } = req.body
    if (!isAdmin(req.user)) return res.sendStatus(403)
    if (!name) return res.sendStatus(400)
    if (typeof name !== 'string' || typeof description !== 'string') return res.sendStatus(400)

    try {
        const quotaType = await prismaClient.quotaType.create({
            data: {
                name: name,
                description: description
            }
        })

        await logEvent({ event: "CREATE", summary: `Create QuotaType`, description: `Created quotaType named=${quotaType.name} [UUID=${quotaType.UUID}]` })
        return res.json({ quotaType })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, name, description } = req.body
    if (!isAdmin(req.user)) return res.sendStatus(403)
    if ((typeof UUID !== "string") || !name) return res.sendStatus(400)
    if (typeof name !== 'string' || typeof description !== 'string') return res.sendStatus(400)

    try {
        const quotaType = await prismaClient.quotaType.update({
            where: { UUID: UUID },
            data: {
                name: name,
                description: description
            }
        })

        await logEvent({ event: "UPDATE", summary: `Update QuotaType`, description: `Updated quotaType named=${quotaType.name} [UUID=${quotaType.UUID}]` })
        return res.json({ quotaType })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;
    if (!isAdmin(req.user)) return res.sendStatus(403)
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const deletedQuotaType = await prismaClient.quotaType.delete({
            where: { UUID: UUID }
        })

        await logEvent({ event: "DELETE", summary: `Delete QuotaType`, description: `Deleted quotaType named=${deletedQuotaType.name} [UUID=${deletedQuotaType.UUID}]` })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
