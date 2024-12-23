import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization'];


    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, jwtConfig.secret, (err: any, decoded: any) => {
        if (err) {
            res.status(403).json({ message: 'Token is not valid' });
            return;
        }

        req.user = decoded.user;

        next();
    });
};
