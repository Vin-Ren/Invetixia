import { Router } from "express";
import { getInvitation, getTicket } from "../controllers/render";


const renderRouter = Router({ mergeParams: true })

renderRouter.get('/invitation/:UUID', getInvitation)
renderRouter.get('/ticket/:UUID', getTicket)

export default renderRouter
