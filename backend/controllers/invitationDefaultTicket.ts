import { Request, Response } from "../types";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../services/database";
import { isOrganisationManager } from "../utils/permissionCheckers";
import { logEvent } from "../utils/databaseLogging";


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
    if (!invitationId || !quotaTypeId || typeof value !== "number") return res.sendStatus(400)

    try {
        const { organisationId } = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: invitationId as string },
            select: { organisationId: true }
        })
        if (!isOrganisationManager(req.user, organisationId)) return res.sendStatus(403)

        const defaultTicket = await prismaClient.defaultTicket.create({
            data: {
                invitationId: invitationId,
                quotaTypeId: quotaTypeId,
                value: value
            }
        });

        await logEvent({ event: "CREATE", summary: `Create DefaultTicket`, description: `Created defaultTicket for invitationId=${invitationId} [UUID=${defaultTicket.UUID}]` })
        return res.json({ defaultTicket })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return res.sendStatus(500)
        }
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, quotaTypeId, value } = req.body
    if (!UUID || !quotaTypeId || typeof value !== "number") return res.sendStatus(400)

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
            where: { UUID: UUID },
            data: {
                quotaTypeId: quotaTypeId,
                value: value
            }
        });

        await logEvent({ event: "UPDATE", summary: `Update DefaultTicket`, description: `Updated default ticket for invitationId=${updatedDefaultTicket.invitationId} [UUID=${updatedDefaultTicket.UUID}]` })
        return res.json({ defaultTicket: updatedDefaultTicket })
    } catch (e) {
        console.log(e)
    }
}


// Delete
export const deleteOne = async (req: Request, res: Response) => {
    const { UUID } = req.body;
    if (typeof UUID !== "string") return res.sendStatus(400)

    try {
        const { invitation } = await prismaClient.defaultTicket.findUniqueOrThrow({
            where: { UUID: UUID },
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

        await logEvent({ event: "DELETE", summary: `Delete DefaultTicket`, description: `Deleted defaultTicket for invitationId=${deletedDefaultTicket.invitationId} [UUID=${deletedDefaultTicket.UUID}]` })
        return res.sendStatus(201)
    } catch (e) {
        console.log(e)
    }
}
