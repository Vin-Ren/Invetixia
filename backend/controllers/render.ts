import { env } from "process";
import { Request, Response } from '../types'
import { prismaClient } from "../services/database";
import { Prisma } from '@prisma/client';
import QRCode, { QRCodeToBufferOptions } from 'qrcode';

const { PUBLIC_FRONTEND_BASE_INVITATION_URL, PUBLIC_FRONTEND_BASE_TICKET_URL } = env

const QRCodeOptions = { errorCorrectionLevel: 'Q', scale:8, margin:2 }


export const getInvitation = async (req: Request, res: Response) => {
    const { UUID } = req.params
    if (typeof UUID !== "string") return res.sendStatus(400)
    try {
        const buffer = await QRCode.toBuffer(`${PUBLIC_FRONTEND_BASE_INVITATION_URL}/${UUID}`, QRCodeOptions as QRCodeToBufferOptions) // only png
        res.contentType('image/png')
        return res.send(buffer)
    } catch (e) {
        console.log(e)
    }
}

export const getTicket = async (req: Request, res: Response) => {
    const { UUID } = req.params
    if (typeof UUID !== "string") return res.sendStatus(400)
    try {
        const buffer = await QRCode.toBuffer(`${PUBLIC_FRONTEND_BASE_TICKET_URL}/${UUID}`, QRCodeOptions as QRCodeToBufferOptions) // only png
        res.contentType('image/png')
        return res.send(buffer)
    } catch (e) {
        console.log(e)
    }
}
