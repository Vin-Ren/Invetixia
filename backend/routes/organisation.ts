import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import { create, deleteOne, getAll, getOne, update } from "../controllers/organisation";


const organisationRouter = Router({ mergeParams: true })

organisationRouter.get('/', verifyToken, getAll)
organisationRouter.get('/info/:UUID', verifyToken, getOne)
organisationRouter.post('/create', verifyToken, create)
organisationRouter.patch('/update', verifyToken, update)
organisationRouter.patch('/delete', verifyToken, deleteOne)


export default organisationRouter
