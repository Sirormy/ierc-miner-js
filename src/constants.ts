import dotenv from "dotenv";
dotenv.config();

export const PROVIDER_RPC = process.env.PROVIDER_RPC;
export const ACCOUNT = process.env.ACCOUNT;
export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const MINE_TIMES = Number(process.env.MINE_TIMES || 1);

export const GAS_PREMIUM = 110;
