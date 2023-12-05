import express from "express";
import cors from 'cors';
import compression from 'compression'

import corsConfig from './config/cors';

const app = express()
app.use(cors(corsConfig))
app.use(compression())

export default app
