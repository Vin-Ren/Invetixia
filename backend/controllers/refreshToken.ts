import { env } from "process";
import { Request, Response, User } from "../types";
import jwt from "jsonwebtoken";
import { prismaClient } from "../database";

const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = env;

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.sendStatus(401);

        const user = await prismaClient.user.findFirst({
            where: {
                tokens: {
                    refresh: refreshToken
                }
            }
        });
        
        if (user === null) return res.sendStatus(403);

        jwt.verify(refreshToken as string, REFRESH_TOKEN_SECRET as string, (err, decoded) => {
            if (err) return res.sendStatus(403);
            
            const { UUID, username, role } = user;
            const accessToken = jwt.sign({ UUID, username, role }, ACCESS_TOKEN_SECRET as string, {
                expiresIn: '5m'
            });
            
            res.json({ accessToken });
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}