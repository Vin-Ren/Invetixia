import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import { create, getOne, update, deleteOne } from "../controllers/invitationDefaultTicket";


const invitationDefaultRouter = Router({ mergeParams: true })

invitationDefaultRouter.get('/info/:UUID', verifyToken, getOne)
invitationDefaultRouter.post('/create', verifyToken, create)
invitationDefaultRouter.patch('/update', verifyToken, update)
invitationDefaultRouter.delete('/delete', verifyToken, deleteOne)


export default invitationDefaultRouter
