import { Router } from "express";
import verifyToken from "../middlewares/verifyToken";
import { auth, sendInvitation, sendTicket, sendTickets } from "../controllers/email";


const emailRouter = Router({ mergeParams: true })

emailRouter.post('/auth', verifyToken, auth)
emailRouter.post('/sendInvitation', verifyToken, sendInvitation)
emailRouter.post('/sendTickets', verifyToken, sendTickets)
emailRouter.post('/sendTicket', verifyToken, sendTicket)


export default emailRouter
