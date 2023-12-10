import { env } from "process";
import { Request, Response } from "../types";
import jwt from "jsonwebtoken";
import { prismaClient } from "../services/database";

const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = env;

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const {refreshToken} = req.cookies;
        if (!refreshToken) return res.sendStatus(401);
    
        jwt.verify(refreshToken as string, REFRESH_TOKEN_SECRET as string, async (err, decoded) => {
            try {
                if (err) return res.sendStatus(401);
    
                const { user } = await prismaClient.tokens.findUniqueOrThrow({
                    where: { refresh: refreshToken },
                    include: { user: true }
                });
    
                if (user === null) return res.sendStatus(401);
    
                const { UUID, username, role, organisationId } = user;
                const accessToken = jwt.sign({ UUID, username, role, organisationId }, ACCESS_TOKEN_SECRET as string, {
                    expiresIn: '15m'
                });
    
                res.json({ accessToken });
            } catch (error) {
                throw error
            }
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}
