import { env } from "process"
require('dotenv').config()

let originList: any[] | string = '*' // allow all by default
if (env.ROOT_DOMAINS != undefined) {
    originList = []
    for (const domain of env.ROOT_DOMAINS.split(',')) {
        if (domain) {
            const subdomainRe = new RegExp(`\.${domain.replace(".", "\\.")}$`)
            originList = [...originList, `http://${domain}`, `https://${domain}`, subdomainRe]
        }
    }
}

const corsConfig = { // ref: https://expressjs.com/en/resources/middleware/cors.html
    origin: originList,
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

export default corsConfig
