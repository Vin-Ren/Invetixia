import { Router } from "express";
import { getInfo, getDetails } from "../controllers/event";

const eventRouter = Router({})

eventRouter.get('/', getInfo)
eventRouter.get('/details', getDetails)

export default eventRouter
