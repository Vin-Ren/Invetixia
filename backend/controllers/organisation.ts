import { Request, Response } from "../types";
import { prismaClient, userRole } from "../database";


// Get
export const getAll = async (req: Request, res: Response) => {
    if (!req.user || req.user.role < userRole.ADMIN) return res.sendStatus(403)

    try {
        const organisations = await prismaClient.organisation.findMany({
            select: {
                name: true,
                managers: { // get highest roled manager
                    orderBy: { role: 'desc' },
                    take: 1
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
    if (!req.user || req.user.role < userRole.ORGANISATION_MANAGER) return res.sendStatus(403)

    const { UUID } = req.params
    const { limitManagers, limitInvitations, limitTickets } = req.query

    try {
        const organisation = await prismaClient.organisation.findFirstOrThrow({
            where: { UUID: UUID as string },
            include: {
                managers: { // by default get the highest roled manager
                    orderBy: { role: 'desc' },
                    take: parseInt(limitManagers as string) || 1
                },
                publishedInvitations: { // by default get 5 most recent invitations
                    orderBy: { createdTime: 'desc' },
                    take: parseInt(limitInvitations as string) || 5
                },
                createdTickets: { // by default get 10 most recent tickets
                    orderBy: { createdTime: 'desc' },
                    take: parseInt(limitTickets as string) || 10
                }
            }
        });
        return res.json({ organisation })
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
            data: { name: newName }
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
