import express from "express";
import cors from 'cors';
import compression from 'compression'

import corsConfig from './config/cors';
import eventRouter from './routes/event';
import userRouter from "./routes/user";
import organisationRouter from "./routes/organisation";
import invitationRouter from "./routes/invitation";
import invitationDefaultRouter from "./routes/invitationDefaultTicket";
import ticketRouter from "./routes/ticket";
import quotaRouter from "./routes/quota";
import quotaTypeRouter from "./routes/quotaType";

const app = express()

app.use(cors(corsConfig))
app.use(express.json({ limit: "64mb" }))
app.use(compression())

app.use('/event', eventRouter)
app.use('/user', userRouter)
app.use('/organisation', organisationRouter)
app.use('/invitation', invitationRouter)
app.use('/invitationDefaultTicket', invitationDefaultRouter)
app.use('/ticket', ticketRouter)
app.use('/quota', quotaRouter)
app.use('/quotaType', quotaTypeRouter)

export default app
