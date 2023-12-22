import { env } from "process"

let originList: any[] | string = '*' // allow all by default
if (env.ROOT_DOMAIN !== undefined) {
    const subdomainRe = new RegExp(`\.${env.ROOT_DOMAIN.replace(".", "\\.")}$`)
    originList = [`http://${env.ROOT_DOMAIN}`, `https://${env.ROOT_DOMAIN}`, subdomainRe]
}

const corsConfig = { // ref: https://expressjs.com/en/resources/middleware/cors.html
    origin: originList,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

export default corsConfig
