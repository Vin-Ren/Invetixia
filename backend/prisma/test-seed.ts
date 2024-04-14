import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { createWriteStream } from 'fs'
import util from 'util'


const rng = (max: number) => Math.floor(Math.random() * max)
const rngTake = (arr: any[]) => { return (arr.length > 0) ? arr[rng(arr.length - 1)] : null }
const rngBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min))


const log_file = createWriteStream(__dirname+'/test-seed.log', {flags: 'a'})
// const stdout = process.stdout
console.log = function(d) { log_file.write(util.format(d) + '\n') }


async function main() {
    const USER_LIMIT = 150
    const INVT_LIM = 150
    const DFQT_LIM = 100
    const TCKT_LIM = 100

    console.log("[TEST-GEN] Starting generation...")
    const prismaClient = new PrismaClient()

    console.log("Generating QuotaTypes...")
    const quotaTypes = ["ENTRY", "PHOTO", "FOOD", "FOOD 2", "SOUVENIER"]
    quotaTypes.forEach(async (quotaType) => {
        try {
            await prismaClient.quotaType.create({
                data: { name: quotaType, description: faker.lorem.sentences({ min: 1, max: 3 }) }
            })
        } catch (e) { }
    })

    let quotaTypeList = []
    for (let i = 0; i < quotaTypes.length; i++) {
        const quotaType_ = await prismaClient.quotaType.findUnique({
            where: { name: quotaTypes[i] }
        })
        quotaTypeList.push(quotaType_)
        console.log(`Generated QtTp{name=${quotaType_?.name}, description=${quotaType_?.description}}`)
    }

    console.log("\n\nGenerating Users...")
    let userList = []
    let organisationList = []
    for (let i = 0; i < USER_LIMIT; i++) {
        const password = faker.string.alphanumeric({ length: 8 })
        const companyName = faker.company.name()
        const user = await prismaClient.user.create({
            data: {
                username: faker.person.fullName(),
                role: rngTake([1, 2, 4, 8]),
                passwordHash: await bcrypt.hash(password, 10),
                organisationManaged: {
                    connectOrCreate: {
                        create: { name: companyName },
                        where: { name: companyName }
                    }
                }
            },
            include: {
                organisationManaged: true
            }
        })
        userList.push(user)
        organisationList.push(user.organisationManaged)
        console.log(`Generated User{name=${user.username}, role=${user.role}, organisation=${companyName}, password=${password}}`)
    }

    console.log("\n\nGenerating invitations")
    let invitationList = []
    for (let i = 0; i < INVT_LIM; i++) {
        const usageQuota = rngBetween(10, 1000)
        const organisation = rngTake(organisationList)
        const invitation = await prismaClient.invitation.create({
            data: {
                name: faker.word.words(3),
                organisationId: organisation.UUID,
                usageQuota: usageQuota,
                usageLeft: usageQuota,
            }
        })
        invitationList.push(invitation)
        console.log(`Generated Invt{name=${invitation.name}, organisation=${organisation.name}, usageQuota=${usageQuota}}`)
    }

    console.log("\n\nGenerating Default Quotas")
    let defaultQuotaList = []
    for (let i = 0; i < DFQT_LIM; i++) {
        try {
            const invitation = rngTake(invitationList)
            const quotaType = rngTake(quotaTypeList)
            const defaultQuota = await prismaClient.defaultQuota.create({
                data: {
                    invitationId: invitation.UUID,
                    quotaTypeId: quotaType.UUID,
                    value: rngBetween(3, 15)
                }
            })
            defaultQuotaList.push(defaultQuota)
            console.log(`Generated DfQt{Invt=${defaultQuota.invitationId}, quotaType=${quotaType.name}, value=${defaultQuota.value}}`)
        } catch (e) { }
    }

    console.log("\n\nGenerating Tickets")
    let ticketList = []
    for (let i = 0; i < TCKT_LIM; i++) {
        try {
            const invitation = rngTake(invitationList)
            const contacts = {
                email: faker.internet.email(),
                phone_number: faker.string.numeric({ length: { min: 10, max: 12 } })
            }
            const ticket = await prismaClient.ticket.create({
                data: {
                    ownerName: faker.person.fullName(),
                    ownerContacts: contacts,
                    ownerAffiliationId: invitation.organisationId,
                    invitationId: invitation.UUID,
                }
            })
            ticketList.push(ticket)
            console.log(`Generated Tckt{ownerName=${ticket.ownerName}, ownerContacts={email=${contacts.email}, phone_number=${contacts.phone_number}} invitation=${invitation.name}}`)
        } catch (e) { }
    }

    console.log("[TEST-GEN] End of generation.")
}

main().then(() => null)
