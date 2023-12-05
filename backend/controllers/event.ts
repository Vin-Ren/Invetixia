import { Request, Response } from 'express'
import event from '../config/event'

export const getInfo = (req: Request, res: Response) => {
    return res.json(event)
}
