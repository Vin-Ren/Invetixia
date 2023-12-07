import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import { create, getAll, getOne, update, deleteOne } from "../controllers/quotaType";


const quotaTypeRouter = Router({ mergeParams: true })

quotaTypeRouter.get('/', getAll)
quotaTypeRouter.get('/info/:UUID', verifyToken, getOne)
quotaTypeRouter.post('/create', verifyToken, create)
quotaTypeRouter.patch('/update', verifyToken, update)
quotaTypeRouter.delete('/delete', verifyToken, deleteOne)


export default quotaTypeRouter
