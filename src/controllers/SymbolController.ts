import { Request, Response } from 'express';
import { Symbol } from '../models/Symbol';
export const create = async (req: Request, res: Response) => {
    try {
        const { asset } = req.body
        const newSymbol = new Symbol({ name:asset })
        await newSymbol.save();
        res.redirect('/admin');
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}