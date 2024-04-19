import { Request, Response } from "../types";
import { Prisma } from "@prisma/client";
import { prismaClient } from "../services/database";
import { isAdmin, isOrganisationManager } from "../utils/permissionCheckers";
import { logEvent } from "../utils/databaseLogging";
import { z } from "zod";

const UUIDValidator = z.string().uuid({ message: 'Invalid UUID' })
const nameValidator = z.string()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(50, { message: 'Name must be at most 50 characters' })
const contactsValidator = z.object({
    email: z.string().email({ message: 'Invalid email' }).nullable(),
    phone_number: z.string().regex(/\d{10,15}$/, { message: 'Invalid phone number' }).nullable()
})


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
    if (typeof UUID !== "string") return res.status(400)

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
                            select: { UUID: true, name: true }
                        },
                        usageLeft: true,
                        quotaTypeId: true
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
    const parsedName = await nameValidator.safeParseAsync(ownerName)
    const parsedContacts = await contactsValidator.safeParseAsync(ownerContacts)
    const errors = {name: '', contacts: ''}
    if (!parsedName.success) errors['name'] = parsedName.error.message
    if (!parsedContacts.success) errors['contacts'] = parsedContacts.error.message

    if (!parsedName.success || !parsedContacts.success || (typeof invitationId !== "string")) return res.status(400).json({errors})


    try {
        const invitation = await prismaClient.invitation.findUniqueOrThrow({
            where: { UUID: invitationId },
            select: {
                usageQuota: true,
                usageLeft: true,
                organisationId: true,
                defaultQuotas: {
                    select: {
                        quotaTypeId: true,
                        value: true
                    }
                }
            }
        })

        const { _count: createdTicketCount } = await prismaClient.ticket.aggregate({
            where: { invitationId: invitationId },
            _count: true
        })

        if (createdTicketCount >= invitation.usageQuota) return res.json(403)

        // if (invitation.usageLeft === 0) return res.json(403)

        const consumeInvitation = prismaClient.invitation.update({
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
                        data: invitation.defaultQuotas.map((e) => { return { quotaTypeId: e.quotaTypeId, usageLeft: e.value } })
                    }
                }
            },
            include: {
                quotas: {
                    include: {
                        quotaType: true
                    }
                }
            }
        })

        const [consumedInvitation, ticket] = await prismaClient.$transaction([
            consumeInvitation,
            createTicket
        ])

        await logEvent({ event: "CONSUME", summary: `Consume Invitation`, description: JSON.stringify(consumedInvitation) })
        await logEvent({ event: "CREATE", summary: `Create Ticket`, description: JSON.stringify(ticket) })
        return res.json({ ticket })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            errors['name'] = "Please enter your full name."
            return res.status(400).json({errors})
        }
        console.log(e)
    }
}


// Patch
export const update = async (req: Request, res: Response) => {
    const { UUID, ownerName, ownerContacts } = req.body
    const parsedName = await nameValidator.safeParseAsync(ownerName)
    const parsedContacts = await contactsValidator.safeParseAsync(ownerContacts)
    const errors = {name: '', contacts: ''}
    if (!parsedName.success) errors['name'] = parsedName.error.message
    if (!parsedContacts.success) errors['contacts'] = parsedContacts.error.message
    // console.log({parsedContacts, errors, UUID, ownerName, ownerContacts })
    if (!parsedName.success || !parsedContacts.success || (typeof UUID !== "string")) return res.status(400).json({errors})

    try {
        const updatedTicket = await prismaClient.ticket.update({
            where: { UUID: UUID },
            data: {
                ownerName: ownerName,
                ownerContacts: ownerContacts,
                sentEmail: "", // Resets sentEmail
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
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return res.sendStatus(404)
        }
        console.log(e)
    }
}
