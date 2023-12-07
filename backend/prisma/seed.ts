import { env } from 'process';
import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client'
import { prismaClient, userRole } from "../services/database";

const { LOG_ACTIONS, QUOTA_TYPES, SUPERUSER_INITIAL_PASSWORD } = env;

function initialize() {
    const logTypes = (
        LOG_ACTIONS !== undefined ?
            LOG_ACTIONS : "CREATE,PATCH,DELETE").split(",")
    logTypes.forEach(act => {
        prismaClient.logAction.create({ data: { name: act } }).catch((err) => {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code == 'P2002') return
            } else {
                console.log(err)
            }
        })
    });


    const quotaTypes = (QUOTA_TYPES !== undefined ?
        QUOTA_TYPES : "ENTRY").split(",")
    quotaTypes.forEach(tp => {
        prismaClient.quotaType.create({ data: { name: tp } }).catch((err) => {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code == 'P2002') return
            } else {
                console.log(err)
            }
        })
    });


    let erred = 0
    let password = SUPERUSER_INITIAL_PASSWORD
    if (password === undefined) {
        password = randomBytes(16).toString('hex');
    } else if (password.length > 50) {
        console.log("provided password is too long, maximum password length is 50 characters. Terminating suepruser account initialization.")
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    prismaClient.user.create({
        data: {
            UUID: "superuser",
            username: "superuser",
            role: userRole.SUPER_ADMIN,
            passwordHash: hashedPassword,
            organisationManaged: {
                connectOrCreate: {
                    where: { UUID: "default", name: "default" },
                    create: { UUID: "default", name: "default" }
                }
            }
        }
    }).catch((err) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code == 'P2002') { erred = 1; return }
        } else {
            console.log(err)
        }
    }).then((_) => {
        if (erred) {
            console.log(`A superuser account has been created before, skipping this step.`)
        } else {
            console.log(`Environment variable: "SUPERUSER_INITIAL_PASSWORD" is not detected, defaulting to random password.\nThe generated password is "${password}"`)
        }
    })
}

initialize()
