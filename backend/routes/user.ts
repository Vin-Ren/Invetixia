import { Router } from "express";
import { refreshToken } from "../controllers/refreshToken";
import { getRoles, getUsers, getUser, create, login, changePassword, update, logout, deleteUser } from "../controllers/user";
import verifyToken from "../middlewares/verifyToken";


const userRouter = Router({caseSensitive:true, mergeParams: true})

userRouter.get('/', verifyToken, getUsers)
userRouter.get('/info/:id', verifyToken, getUser)

userRouter.post('/create', verifyToken, create)
userRouter.post('/login', verifyToken, login)
userRouter.post('/changePassword', verifyToken, changePassword)
userRouter.patch('/update', verifyToken, update)
userRouter.post('/logout', verifyToken, logout)
userRouter.delete('/delete/:id', verifyToken, deleteUser)

userRouter.get('/refreshToken', refreshToken)
userRouter.get('/roles', getRoles)

export default userRouter
