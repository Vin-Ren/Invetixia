import { Router } from "express";
import { getInfo } from "../controllers/event";

const eventRouter = Router({})

eventRouter.get('/', getInfo)

export default eventRouter
