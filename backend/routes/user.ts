import { Router } from "express";
import { refreshToken } from "../controllers/refreshToken";
import { getRoles, getAll, getOne, getSelf, create, login, changePassword, update, logout, deleteOne } from "../controllers/user";
import verifyToken from "../middlewares/verifyToken";


const userRouter = Router({ mergeParams: true })

userRouter.get('/', verifyToken, getAll)
userRouter.get('/info/:UUID', verifyToken, getOne)
userRouter.get('/self', verifyToken, getSelf)

userRouter.post('/create', verifyToken, create)
userRouter.post('/login', login)
userRouter.post('/changePassword', verifyToken, changePassword)
userRouter.patch('/update', verifyToken, update)
userRouter.post('/logout', verifyToken, logout)
userRouter.delete('/delete', verifyToken, deleteOne)

userRouter.get('/refreshToken', refreshToken)
userRouter.get('/roles', getRoles)

export default userRouter
