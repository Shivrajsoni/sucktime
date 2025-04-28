export interface SignUpIncomingMessage {
    ip:string;
    publickey:string;
    signedMessage:string;
    callbackId:string;
}

export interface ValidateIncomingMessage {
    callbackId:string;
    signedMessage:string;
    status:"Good" | "Bad";
    latency:number;
    websiteId:string;
    validatorId:string;
}

export interface SignOutgoingMessage {
    validatorId:string;
    callbackId:string;    
}

export interface ValidateOutgoingMessage {
    url:string;
    callbackId:string;
    websiteId:string;
}
export type IncomingMessage = {
    type:'signup'
    data:SignUpIncomingMessage
} | {
    type:'validate'
    data:ValidateIncomingMessage
}

export type OutgoingMessage = {
    type:'signup'
    data:SignOutgoingMessage
} | {
    type:'validate'
    data:ValidateOutgoingMessage
}