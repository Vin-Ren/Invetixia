import express from "express";
import cors from 'cors';
import compression from 'compression'

import eventRouter from './routes/event';
import corsConfig from './config/cors';

const app = express()
app.use(cors(corsConfig))
app.use(compression())

app.use('/event', eventRouter)

export default app
