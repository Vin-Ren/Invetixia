import { Router } from "express";
import { getInfo, getDetails, update, getAsAdmin } from "../controllers/event";
import verifyToken from "../middlewares/verifyToken";

const eventRouter = Router({})

eventRouter.get('/', getInfo)
eventRouter.get('/details', getDetails)
eventRouter.get('/get', verifyToken, getAsAdmin)
eventRouter.patch('/update', verifyToken, update)

export default eventRouter
