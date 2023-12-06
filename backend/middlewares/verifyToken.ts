import { env } from 'process';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Request, User } from '../types';

const { ACCESS_TOKEN_SECRET } = env;


function verifyToken(req: Request, res: Response, next: NextFunction) {
    const tokenHeader = req.headers.authorization
    if (!tokenHeader) return res.sendStatus(403)

    const token = tokenHeader.split(' ')[1]

    jwt.verify(token, ACCESS_TOKEN_SECRET as string, (err, decoded) => {
        if (err) return res.sendStatus(403)
        req.user = (decoded as User)
        next()
    })
};

export default verifyToken;
