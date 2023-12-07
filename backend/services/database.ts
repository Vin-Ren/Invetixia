import { env } from "process";
import { PrismaClient } from "@prisma/client";

const { ENABLE_QUERY_LOGGING } = env;

export enum userRole {
    SUPER_ADMIN = 0b1000,
    ADMIN = 0b0100,
    ORGANISATION_MANAGER = 0b0010,
    OBSERVER = 0b0001
}

export type logActionT = "CREATE" | "UPDATE" | "CONSUME" | "RESTORE" | "DELETE";
export enum logAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    CONSUME = "CONSUME",
    RESTORE = "RESTORE",
    DELETE = "DELETE"
}


function createPrismaClient() {
    if (ENABLE_QUERY_LOGGING) {
        const prismaClient = new PrismaClient({
            log: [{ level: 'query', emit: 'event' }]
        })
        prismaClient.$on('query', (event) => console.log({ event }))
        return prismaClient
    } else {
        const prismaClient = new PrismaClient()
        return prismaClient
    }
}

export const prismaClient = createPrismaClient()
