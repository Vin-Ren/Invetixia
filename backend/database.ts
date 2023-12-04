import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient();

export const userRole = { 
    SUPER_ADMIN: 0b1000, 
    ADMIN: 0b0100, 
    ORGANISATION_MANAGER: 0b0010, 
    OBSERVER: 0b0001 
}
