import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import { create, getAll, getOne, getOnePublic, getTickets, getDefaultQuotas, update, deleteOne } from "../controllers/invitation";


const invitationRouter = Router({ mergeParams: true })

invitationRouter.get('/', verifyToken, getAll)
invitationRouter.get('/public/:UUID', getOnePublic)
invitationRouter.get('/info/:UUID', verifyToken, getOne)
invitationRouter.get('/info/:UUID/tickets', verifyToken, getTickets)
invitationRouter.get('/info/:UUID/defaultQuotas', verifyToken, getDefaultQuotas)
invitationRouter.post('/create', verifyToken, create)
invitationRouter.patch('/update', verifyToken, update)
invitationRouter.delete('/delete', verifyToken, deleteOne)


export default invitationRouter
