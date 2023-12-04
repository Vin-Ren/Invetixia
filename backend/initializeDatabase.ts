import bcrypt from 'bcrypt'
import { Prisma } from '@prisma/client'
import { prismaClient, userRole } from "./database";
import { randomBytes, randomUUID } from 'crypto';


async function initialize() {
    const logTypes = (
        process.env.LOG_TYPES!==undefined ? 
        process.env.LOG_TYPES : "CREATE,PATCH,DELETE").split(",")
    logTypes.forEach(tp => {
        prismaClient.logType.create( { data: {name: tp} } ).catch( (err) => {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code=='P2002') return
            } else {
                console.log(err)
            }
        })
    });
    
    
    const quotaTypes = (process.env.QUOTA_TYPES!==undefined ? 
                        process.env.QUOTA_TYPES : "ENTRY").split(",")
    quotaTypes.forEach(tp => {
        prismaClient.quotaType.create( { data: {name: tp} } ).catch( (err) => {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code=='P2002') return
            } else {
                console.log(err)
            }
        })
    });
    

    let erred=0
    let password = process.env.SUPERUSER_INITIAL_PASSWORD
    if (password===undefined) {
        password=randomBytes(16).toString('hex');
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    prismaClient.user.create( { 
        data: { 
            username: "superuser", 
            role: userRole.SUPER_ADMIN,
            passwordHash: hashedPassword, 
            organisationManaged: {
                connectOrCreate: {
                    where: { name: "default" },
                    create: { name: "default" }
                }
            } 
        } 
    }).catch( (err) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code=='P2002') {erred=1;return}
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
