import { Router } from "express";
import { refreshToken } from "../controllers/refreshToken";
import { getRoles, getUsers, create, login, changePassword, logout } from "../controllers/user";
import verifyToken from "../middlewares/verifyToken";


const userRouter = Router({caseSensitive:true, mergeParams: true})

userRouter.get('/', verifyToken, getUsers)
userRouter.get('/roles', getRoles)
userRouter.post('/create', verifyToken, create)
userRouter.post('/login', verifyToken, login)
userRouter.post('/changePassword', verifyToken, changePassword)
userRouter.post('/logout', verifyToken, logout)
userRouter.get('/refreshToken', refreshToken)

export default userRouter
