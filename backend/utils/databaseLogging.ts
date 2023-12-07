import { prismaClient, logActionT } from "../services/database";

interface logEventArgs {
    event: logActionT,
    summary: string,
    description?: string
}

export const logEvent = async ({ event, summary, description="" }: logEventArgs) => {
    return await prismaClient.log.create({
        data: {
            summary: summary,
            description: description,
            logAction: {
                connect: { name: event }
            }
        }
    })
}
