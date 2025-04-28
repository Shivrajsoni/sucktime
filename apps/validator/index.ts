import { randomUUIDv7 } from "bun";
import type { OutgoingMessage, SignOutgoingMessage, ValidateOutgoingMessage } from "@repo/common";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

const CALLBACKS: {[callbackId: string]: (data: SignOutgoingMessage) => void} = {}
