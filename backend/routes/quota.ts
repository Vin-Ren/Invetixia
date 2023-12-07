import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import { create, getAll, getOne, consume, update, deleteOne } from "../controllers/quota";


const quotaRouter = Router({ mergeParams: true })

quotaRouter.get('/', verifyToken, getAll)
quotaRouter.get('/public/:UUID', getOne)
quotaRouter.get('/info/:UUID', getOne)
quotaRouter.post('/create', verifyToken, create)
quotaRouter.post('/consume', verifyToken, consume)
quotaRouter.patch('/update', verifyToken, update)
quotaRouter.delete('/delete', verifyToken, deleteOne)


export default quotaRouter
