import { env } from "process";
import { Request, Response } from '../types'
import { prismaClient } from "../services/database";
import { Prisma } from '@prisma/client';
import { InvitationEmail } from '../emails/invitation-email'
import { TicketEmail } from '../emails/ticket-email'
import { Resend } from "resend";
import { isAdmin } from "../utils/permissionCheckers";

const { PUBLIC_FRONTEND_BASE_INVITATION_URL, PUBLIC_FRONTEND_BASE_TICKET_URL, PUBLIC_FRONTEND_BACKGROUND_URL, PUBLIC_FRONTEND_LOGO_URL, BACKEND_BASE_RENDER_URL, EVENT_TIMEZONE } = env
let resendClient: Resend | undefined = undefined;
let senderDomain = "";
const senderName = "no-reply";


export const auth = async (req: Request, res: Response) => {
    const { apiKey, domain = "" } = req.body;
    if (typeof apiKey !== "string" || typeof domain !== "string") return res.sendStatus(400);
    if (!isAdmin(req.user)) return res.sendStatus(403);

    try {
        const oldResendClient = resendClient
        resendClient = new Resend(apiKey)
        if (!domain) {
            const data = await resendClient?.domains.list()
            if (data.data?.data.length) {
                senderDomain = data.data?.data[0].name
            } else {
                resendClient = oldResendClient
                return res.sendStatus(400)
            }
        } else {
            senderDomain = domain
        }

        return res.sendStatus(200)
    } catch (e) {
        console.log(e)
    }
}


export const sendInvitation = async (req: Request, res: Response) => {
    const { UUID, to = [] }: { UUID: string, to: string[] } = req.body;
    if (typeof UUID !== "string") return res.sendStatus(400);
    if (!isAdmin(req.user)) return res.sendStatus(403);

    try {
        const event_info = await prismaClient.iNTERNALS_InvetixiaConfig.findUniqueOrThrow({ where: { name: 'event_info' } })
        const eventName = (event_info.value as { name?: string })?.name || "";

        const data = await resendClient?.emails.send({
            from: `${senderName}@${senderDomain}`,
            to,
            subject: `Invitation to ${eventName}`,
            react: InvitationEmail({
                event: { name: eventName },
                bgUrl: PUBLIC_FRONTEND_BACKGROUND_URL,
                logoUrl: PUBLIC_FRONTEND_LOGO_URL,
                invitationLink: `${PUBLIC_FRONTEND_BASE_INVITATION_URL}/${UUID}`,
                qrImgUrl: `${BACKEND_BASE_RENDER_URL}/invitation/${UUID}`
            })
        })

        if (data?.data?.id) {
            return res.sendStatus(200)
        } else {
            return res.sendStatus(400)
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return res.sendStatus(404)
        }
        console.log(e)
    }
}

export const sendTickets = async (req: Request, res: Response) => {
    const { limit = 1 }: { limit: number } = req.body;
    if (!isAdmin(req.user)) return res.sendStatus(403);

    try {
        const [tickets, event_info, event_details] = await prismaClient.$transaction([
            prismaClient.ticket.findMany({ where: { sentEmail: "" }, take: Math.min(limit, 100) }),
            prismaClient.iNTERNALS_InvetixiaConfig.findUniqueOrThrow({ where: { name: 'event_info' } }),
            prismaClient.iNTERNALS_InvetixiaConfig.findUniqueOrThrow({ where: { name: 'event_details' } })
        ])

        const eventName = (event_info.value as { name?: string })?.name || "";
        const eventLocationName = (event_details.value as { locationName?: string })?.locationName || "";
        const eventStartTime = (event_details.value as { startTime?: Date })?.startTime || new Date();

        const data = await resendClient?.batch.send(tickets.map(({ UUID, ownerName, ownerContacts }) => {
            return ({
                from: `${senderName}@${senderDomain}`,
                to: [(ownerContacts as { email: string })?.email],
                subject: `Your ticket for ${eventName}`,
                react: TicketEmail({
                    event: { name: eventName || "", locationName: eventLocationName, startTime: eventStartTime },
                    ownerName: ownerName,
                    bgUrl: PUBLIC_FRONTEND_BACKGROUND_URL,
                    logoUrl: PUBLIC_FRONTEND_LOGO_URL,
                    ticketLink: `${PUBLIC_FRONTEND_BASE_TICKET_URL}/${UUID}`,
                    qrImgUrl: `${BACKEND_BASE_RENDER_URL}/ticket/${UUID}`,
                    timezone: EVENT_TIMEZONE
                })
            })
        }))

        const deliveredList: any[] = []
        for (let i = 0; i < Math.min(limit, 100); i++) {
            if (data?.data?.data[i].id) deliveredList.push({ UUID: tickets[i].UUID, sentMail: data.data.data[i].id });
        }

        if (deliveredList.length) {
            await prismaClient.$transaction(deliveredList.map((e) =>
                prismaClient.ticket.update({ where: { UUID: e.UUID }, data: { sentEmail: e.sentMail } })
            ))
            return res.sendStatus(200)
        } else {
            return res.sendStatus(400)
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return res.sendStatus(404)
        }
        console.log(e)
    }
}

export const sendTicket = async (req: Request, res: Response) => {
    const { UUID } = req.body
    if (typeof UUID !== "string") return res.sendStatus(400)
    if (!isAdmin(req.user)) return res.sendStatus(403)
    try {
        const [ticket, event_info, event_details] = await prismaClient.$transaction([
            prismaClient.ticket.findUniqueOrThrow({ where: { UUID } }),
            prismaClient.iNTERNALS_InvetixiaConfig.findUniqueOrThrow({ where: { name: 'event_info' } }),
            prismaClient.iNTERNALS_InvetixiaConfig.findUniqueOrThrow({ where: { name: 'event_details' } })
        ])

        if (!((ticket.ownerContacts as { email?: string })?.email)) return res.sendStatus(400);
        const eventName = (event_info.value as { name?: string })?.name || "";
        const eventLocationName = (event_details.value as { locationName?: string })?.locationName || "";
        const eventStartTime = (event_details.value as { startTime?: Date })?.startTime || new Date();

        const data = await resendClient?.emails.send({
            from: `${senderName}@${senderDomain}`,
            to: [(ticket.ownerContacts as { email: string })?.email],
            subject: `Your ticket for ${eventName}`,
            react: TicketEmail({
                event: { name: eventName || "", locationName: eventLocationName, startTime: eventStartTime },
                ownerName: ticket.ownerName,
                bgUrl: PUBLIC_FRONTEND_BACKGROUND_URL,
                logoUrl: PUBLIC_FRONTEND_LOGO_URL,
                ticketLink: `${PUBLIC_FRONTEND_BASE_TICKET_URL}/${UUID}`,
                qrImgUrl: `${BACKEND_BASE_RENDER_URL}/ticket/${UUID}`,
                timezone: EVENT_TIMEZONE
            })
        })

        if (data?.data?.id) {
            await prismaClient.ticket.update({ where: { UUID }, data: { sentEmail: data.data.id } })
            return res.sendStatus(200)
        } else {
            return res.sendStatus(400)
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return res.sendStatus(404)
        }
        console.log(e)
    }
}
