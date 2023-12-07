import { Request, Response } from "../types";
import { prismaClient } from "../database";
import { isOrganisationManager } from "../utils/permissionCheckers";


// Get
export const getOne = async (req: Request, res: Response) => {
    const { UUID } = req.params
    
    try {
        const { invitation } = await prismaClient.defaultTicket.findUniqueOrThrow({
            where: { UUID: UUID as string },
            select: {
                invitation: {
                    select: {
                        organisationId: true
                    }
                }
            }
        })
        if (!isOrganisationManager(req.user, invitation.organisationId)) return res.sendStatus(403)

        const defaultTicket = await prismaClient.defaultTicket.findUniqueOrThrow({
            where: { UUID: UUID as string },
            select: {
                invitation: {
                    select: {
                        UUID: true,
                        name: true
                    }
                },
                quotaType: {
                    select: { name: true }
                },
                value: true
            }
        })
        return res.json({ defaultTicket })
    } catch (e) {
        console.log(e)
    }
}


// Post
export const create = async (req: Request, res: Response) => {
    const { invitationId, quotaTypeId, value } = req.body
    if (!invitationId || !quotaTypeId || typeof value!== "number") return res.sendStatus(400)
    
    try {
        const { organisationId } = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: invitationId as string },
            select: { organisationId: true }
        })
        if (!isOrganisationManager(req.user, organisationId)) res.sendStatus(403)

        const defaultTicket = await prismaClient.defaultTicket.create({
            data: {
                invitationId: invitationId,
                quotaTypeId: quotaTypeId,
                value: value
            }
        });
        return res.json({ defaultTicket })
    } catch (e) {
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {

    const { UUID, quotaTypeId, value } = req.body
    if (!UUID || !quotaTypeId || typeof value!== "number") return res.sendStatus(400)
    
    try {
        const { invitation } = await prismaClient.defaultTicket.findUniqueOrThrow({
            where: { UUID: UUID as string },
            select: {
                invitation: {
                    select: { organisationId: true }
                }
            }
        })
        if (!isOrganisationManager(req.user, invitation.organisationId)) return res.sendStatus(403)

        const updatedDefaultTicket = await prismaClient.defaultTicket.update({
            where: { UUID: UUID as string },
            data: {
                quotaTypeId: quotaTypeId,
                value: value
            }
        });
        return res.json({ defaultTicket: updatedDefaultTicket })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;

    try {
        const { invitation } = await prismaClient.defaultTicket.findUniqueOrThrow({
            where: { UUID: UUID as string },
            select: {
                invitation: {
                    select: { organisationId: true }
                }
            }
        })
        if (!isOrganisationManager(req.user, invitation.organisationId)) return res.sendStatus(403)

        const deletedDefaultTicket = await prismaClient.defaultTicket.delete({
            where: { UUID: UUID }
        })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
