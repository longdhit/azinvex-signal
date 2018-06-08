import { Request, Response } from 'express';
import { createToken, verifyToken } from '../lib/jwt';
export const cannotBeAdmin = (req: Request, res: Response, next) => {
    const { token } = req.cookies;
    verifyToken(token)
    .then(() => res.redirect('/'))
    .catch(() => next());
};

export const mustBeAdmin = (req: Request, res: Response, next) => {
    const { token } = req.cookies;
    verifyToken(token)
    .then(() => next())
    .catch(() => res.redirect('/login'));
};
