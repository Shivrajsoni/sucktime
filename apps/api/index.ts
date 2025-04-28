import express from "express";
import { AuthMiddleware } from "./middleware";
import { prisma } from "@repo/db/client";
import cors from "cors";
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
const connection = new Connection('https://api.mainnet-beta.solana.com')
const app = express();

const publicKey = new PublicKey(process.env.PUBLIC_KEY!);

app.use(express.json());
app.use(cors());
app.post('/api/v1/website',AuthMiddleware,async(req,res)=>{
    try {
        const userId = req.userId!;
        const {url} = req.body;
        const data = await prisma.website.create({
            data:{
                url,
                userId
            }
        })
        console.log('Successfully posting WebsitDataApi');
        res.json({
            id: data.id
        })
    } catch (error) {
        throw new Error('Error in data posting of website');
    }
})

app.get('/api/v1/website/status',AuthMiddleware,async(req,res)=>{
    const websiteId = req.query.websiteId! as unknown as string;
    const userId = req.userId;

    try {
        const data = await prisma.website.findFirst({
            where:{
                id:websiteId,
                userId,
                disabled:false
            },
            include:{
                ticks:true
            }
        })
        console.log('api/v1/website/status route is working properly');
        res.json(data);
    } catch (error) {
        throw new Error('api/v1/website/status route is not working properly')   
    }
})

app.get('/api/v1/websites',AuthMiddleware,async(req,res)=>{
    const userId = req.userId!;
    try {
        const websites = await prisma.website.findMany({
            where:{
                userId,
                disabled:false
            },
            include:{
                ticks:true
            }
        })
        console.log('/api/v1/websites is working properly ' );
        res.json({websites});
    } catch (error) {
        console.log(error);
        throw new Error(`Error in /api/v1/websites api `);
    }
})

app.delete('/api/v1/website',AuthMiddleware,async(req,res)=>{
    const userId = req.userId;
    const websiteId = req.query.websiteId! as unknown as string; 
    try {
        const data = await prisma.website.update({
            where:{
                id:websiteId,
                userId
            },
            data:{
                disabled:true
            }
        })
        console.log("/api/v1/website deleting api is working properly fuckker!!");
        res.json({message:"Successfully deleted the WebSite"});
        
    } catch (error) {
        console.log(error);
        throw new Error('/api/v1/website deleting api is not working');
    }    
})

app.post('/api/v1/payout:validatorId',AuthMiddleware,async(req,res)=>{
    const validatorId = req.params.validatorId! as string ;
    
    const validator = await prisma.validator.findFirst({
        where:{
            id:validatorId
        }
    })
    if (!validator) {
        res.status(400).json({
          message: "Validator not found",
        });
    }

    if(validator!.isAmountClaimed){
        res.json({message:"Amount Already Claimed"})
    }


    try {
        await prisma.validator.update({
            where:{
                id:validatorId
            },
            data:{
                isAmountClaimed:true
            }
        });
        // transaction send to the validator
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey:publicKey,
                toPubkey:new PublicKey(validator!.publicKey),
                lamports:validator!.pendingPayouts
            })
        );
        const signer = Keypair.fromSecretKey(
            Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY!))
        );
        const signature = await sendAndConfirmTransaction(connection, transaction, [
        signer]);
            
        await prisma.solanaTransactions.create({
            data: {
              validatorId,
              amount: validator!.pendingPayouts,
              createdAt: new Date(),
              signature,
            },
        });
        res.json({
            message:"Payout Successfully"
        })
    } catch (error) {
        console.log(error);
        throw new Error(`Error Occured ${error}`)
    }
})

app.listen(4000,()=>{
    console.log(`API Server is running at port 4000`);
})