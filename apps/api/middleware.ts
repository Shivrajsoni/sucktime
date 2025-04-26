import type { Request,NextFunction,Response } from "express";
export function AuthMiddleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers["authorization"];
    
    req.userId = "1";
    next(); 
}