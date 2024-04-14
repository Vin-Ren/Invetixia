import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import { create, createMany, deleteOne, getAll, getOne, getInvitations, getManagers, getTickets, update, deleteMany } from "../controllers/organisation";


const organisationRouter = Router({ mergeParams: true })

organisationRouter.get('/', verifyToken, getAll)
organisationRouter.get('/info/:UUID', verifyToken, getOne)
organisationRouter.get('/info/:UUID/managers', verifyToken, getManagers)
organisationRouter.get('/info/:UUID/invitations', verifyToken, getInvitations)
organisationRouter.get('/info/:UUID/tickets', verifyToken, getTickets)
organisationRouter.post('/create', verifyToken, create)
organisationRouter.post('/createMany', verifyToken, createMany)
organisationRouter.patch('/update', verifyToken, update)
organisationRouter.delete('/delete', verifyToken, deleteOne)
organisationRouter.delete('/deleteMany', verifyToken, deleteMany)


export default organisationRouter
