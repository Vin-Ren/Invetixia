import { env } from 'process';
import express from "express";
import cors from 'cors';
import compression from 'compression'


let originList: any[] = ['*'] // allow all by default
if (env.ROOT_DOMAIN !== undefined) {
    const subdomainRe = new RegExp(`\.${env.ROOT_DOMAIN.replace(".", "\\.")}$`)
    originList = [`http://${env.ROOT_DOMAIN}`, `https://${env.ROOT_DOMAIN}`, subdomainRe]
}

var corsOptions = { // ref: https://expressjs.com/en/resources/middleware/cors.html
    origin: originList, 
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express()
app.use(cors(corsOptions))
app.use(compression())

export default app
