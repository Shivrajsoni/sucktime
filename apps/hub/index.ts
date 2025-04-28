// hub is a entity which will transfer request to validator and tell them what url they have to request after this , validator will give response
// it's a client -server model , we will use websockets
import { randomUUIDv7,type ServerWebSocket } from "bun";
import {prisma } from "@repo/db/client";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import type {IncomingMessage,SignUpIncomingMessage} from "@repo/common"
const COST_PER_VALUATION = 100;
const CALLBACKS :{[callbackId:string]:(data:IncomingMessage)=>void}= {};

const availableValidators :{validatorId:string,socket:ServerWebSocket<unknown>,publicKey:string}[] = [];

Bun.serve({
    fetch(request, server) {
        if(server.upgrade(request)){
            return;
        }
        return new Response("Upgrade Failed",{status:500})
    },
    port:8081,
    websocket:{
        async message(ws:ServerWebSocket<unknown>,msg:string){

        },
        async close(ws:ServerWebSocket<unknown>){
            availableValidators.splice(availableValidators.findIndex(v => v.socket ===ws),1);
        }

    }
});

async function SignUpHandler(ws:ServerWebSocket<unknown>,{ip,publickey,signedMessage,callbackId}:SignUpIncomingMessage){
    const validatorDb = await prisma.validator.findFirst({
        where:{
            publicKey:publickey
        }
    })

    if(validatorDb){
        ws.send(JSON.stringify({
            type:'signup',
            data:{
                validatorId:validatorDb.id,
                callbackId
            }
        }));
        availableValidators.push({
            validatorId:validatorDb.id as string,
            socket:ws,
            publicKey:publickey as string
        });
        return;
    }
    // reterive the ip from the validator Request
    const validator = await prisma.validator.create({
        data:{
            ip,
            publicKey:publickey,
            location:'unknown'
        }
    })
    if(!validator){
        throw new Error('Error While Validating a user');
    }
    
    ws.send(JSON.stringify({
        type:'signup',
        data:{
            validatorId:validator.id,
            callbackId
        }
    }));

    availableValidators.push({
        validatorId:validator.id,
        socket:ws,
        publicKey:publickey as string,
    });
}

async function verifyMessage(message: string, publicKey: string, signature: string){
    const messageBytes = nacl_util.decodeUTF8(message);
    const result = nacl.sign.detached.verify(
        messageBytes,
        new Uint8Array(JSON.parse(signature)),
        new PublicKey(publicKey).toBytes()
    );
    return result;
}


setInterval(async()=>{
    const websiteMonitor = await prisma.website.findMany({
        where:{
            disabled:true
        }
    });
    for(const website of websiteMonitor){
        availableValidators.forEach(validator =>{
            const callbackId = randomUUIDv7();
            console.log(`Sending Validate to ${validator.validatorId} ${website.url}`)
            validator.socket.send(JSON.stringify({
                type:'validate',
                data:{
                    url:website.url,
                    callbackId
                }
            }));
            CALLBACKS[callbackId] = async(data:IncomingMessage) =>{
                if(data.type ==="validate"){
                    const {validatorId,status,latency,signedMessage} = data.data;
                    const verifiedMessage = await verifyMessage(
                        `Replying to Callback ${callbackId}`,
                        validator.publicKey,
                        signedMessage
                    );
                    if(!verifiedMessage){
                        return;
                    }
                    await prisma.$transaction(async(tx)=>{
                        await tx.websiteTick.create({
                            data:{
                                websiteId:website.id,
                                validatorId,
                                status,
                                latency,
                                createdAt:new Date()
                            }
                        }
                    )
                    await tx.validator.update({
                        where:{
                            id:validatorId
                        },
                        data:{
                            pendingPayouts: {increment:COST_PER_VALUATION}
                        }
                    })
                    })

                }
            }
        })
    }


},1000*60);