import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import { create, getAll, getOne, update, deleteOne } from "../controllers/ticket";


const ticketRouter = Router({ mergeParams: true })

ticketRouter.get('/', verifyToken, getAll)
ticketRouter.get('/public/:UUID', getOne)
ticketRouter.get('/info/:UUID', getOne)
ticketRouter.post('/create', verifyToken, create)
ticketRouter.patch('/update', verifyToken, update)
ticketRouter.delete('/delete', verifyToken, deleteOne)


export default ticketRouter
