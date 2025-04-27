import type { Request,NextFunction,Response } from "express";
import jwt, { decode } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export function AuthMiddleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers["authorization"] as string;
    if(!token){
        console.log('No jwt token found');
        res.json({message:"No Jwt token found"});
    }
    const decoded = jwt.verify(token,JWT_SECRET);   
    if(!decoded || !decoded.sub){
        console.log(`Not An Authorized User`);
        res.status(404).json({
            message:"Signin to get Authorized first"
        })
    } 
    req.userId = decoded.sub as string;
    next(); 
}