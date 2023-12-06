import { Router } from "express";
import { refreshToken } from "../controllers/refreshToken";
import { getRoles, getUsers, create, login, changePassword, logout } from "../controllers/user";


const userRouter = Router({caseSensitive:true, mergeParams: true})

userRouter.get('/', getUsers)
userRouter.get('/roles', getRoles)
userRouter.post('/create', create)
userRouter.post('/login', login)
userRouter.post('/changePassword', changePassword)
userRouter.post('/logout', logout)
userRouter.get('/refreshToken', refreshToken)

export default userRouter
