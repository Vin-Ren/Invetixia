import { env } from 'process';
import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client'
import { prismaClient, userRole, logAction } from "../services/database";


const { QUOTA_TYPES, SUPERUSER_PASSWORD } = env;


function initialize() {
    prismaClient.iNTERNALS_InvetixiaConfig.createMany({
        data: [
            {
                name: 'event_info',
                value: {
                    name: "Invetixia", // title on hero
                    description: "Invetixia launching event", // description on hero
                }
            },
            {
                name: 'event_details',
                value: {
                    locationName: "a Zoom meeting",
                    startTime: new Date("2024-05-15T00:00:00.000+00:00"),
                }
            },
            {
                name: 'event_socials',
                value: {
                    mainWebsite: "https://example.com",
                    instagram: "https://instagram.com/instagram",
                    youtube: "https://youtube.com/youtube",
                    x_twitter: "https://x.com/",
                    email: "example@mail.com"
                }
            }
        ]
    }).catch((err)=> {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code == 'P2002') return
        } else {
            console.log(err)
        }
    })

    const logActions = Object.values(logAction)
    logActions.forEach(act => {
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
    let password = SUPERUSER_PASSWORD
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
            console.log(`Environment variable: "SUPERUSER_PASSWORD" is not detected, defaulting to random password.\nThe generated password is "${password}"`)
        }
    })
}

initialize()
