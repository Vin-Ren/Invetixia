import { Request, Response } from 'express'
import { prismaClient } from "../services/database";
import { Prisma } from '@prisma/client';

export const getInfo = async (req: Request, res: Response) => {
    try {
        const {value: base_info} = await prismaClient.iNTERNALS_InvetixiaConfig.findUniqueOrThrow({
            where: { name: 'event_info' }
        });
        const {value: event_socials} = await prismaClient.iNTERNALS_InvetixiaConfig.findUniqueOrThrow({
            where: { name: 'event_socials' }
        });
        return res.json({event: { ...(base_info as Object), socials: event_socials} })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            return res.sendStatus(404)
        }
        console.log(e)
    }
}
