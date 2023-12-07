import { Request, Response } from "../types";
import { prismaClient } from "../database";
import { isAdmin } from "../utils/permissionCheckers";


// Get
export const getAll = async (req: Request, res: Response) => {
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
    
    try {
        const quotaType = await prismaClient.quotaType.findUnique({
            where: {UUID:UUID},
            include: {
                quotas: {
                    select: {
                        UUID: true,
                        ticket: {
                            select: {
                                ownerName: true
                            }
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
    const { name, description } = req.body
    if (!name || !description) return res.sendStatus(400)
    if (!isAdmin(req.user)) return res.sendStatus(403)
    
    try {
        const quotaType = await prismaClient.quotaType.create({
            data: {
                name: name,
                description: description
            }
        })
        return res.json({ quotaType })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, name, description } = req.body
    if (!UUID || !name || !description) return res.sendStatus(400)
    if (!isAdmin(req.user)) return res.sendStatus(403)
    
    try {
        const quotaType = await prismaClient.quotaType.update({
            where: {
                UUID: UUID
            },
            data: {
                name: name,
                description: description
            }
        })
        return res.json({ quotaType })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;
    if (!isAdmin(req.user)) return res.sendStatus(403)

    try {
        const deletedQuotaType = await prismaClient.quotaType.delete({
            where: {UUID: UUID}
        })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
