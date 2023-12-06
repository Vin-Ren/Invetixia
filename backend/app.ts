import express from "express";
import cors from 'cors';
import compression from 'compression'

import corsConfig from './config/cors';
import eventRouter from './routes/event';
import userRouter from "./routes/user";
import organisationRouter from "./routes/organisation";

const app = express()

app.use(cors(corsConfig))
app.use(express.json({ limit: "64mb" }))
app.use(compression())

app.use('/event', eventRouter)
app.use('/user', userRouter)
app.use('/organisation', organisationRouter)

export default app
