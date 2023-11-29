import { ethers } from "ethers";
import {
  GAS_PREMIUM,
  PROVIDER_RPC,
  MINE_TIMES as targetMineTimes,
} from "../constants";
import { sleep } from "../utils";
import { stringToHex } from "../utils";
import Spinnies from "spinnies";
import { logger } from "../utils";
import { bnUtils } from "../utils";
import { sayMinerLog } from "../utils";
import dayjs from "dayjs";
import { generateNonce } from "../utils";
import { readFile } from "fs/promises";

let unique = 0;
export const runMine = async (tick: string, accountIndex: number) => {
  sayMinerLog();
  const wallets = require("../../wallet.json");
  const privateKey = wallets[accountIndex];
  const str = await readFile("./tokens.json", "utf-8");
  const ticks = JSON.parse(str) as Record<
    string,
    { amt: string; workc: string }
  >;

  const tickInfo = ticks[tick];
  if (!tickInfo) {
    throw new Error(
      `Mining attempt failed: 'tick' value ${tick} is not found in tokens.json.`,
    );
  }
  const { amt, workc } = tickInfo;
  if (!privateKey) {
    throw new Error("Mining user configuration not found");
  }

  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_RPC);
  const miner = new ethers.Wallet(privateKey, provider);
  const account = miner.address;
  logger.trace(`Start mining with ${account}`);

  const network = await provider.getNetwork();
  logger.trace(`network is ${network.name} (chainID: ${network.chainId})`);

  const currentGasPrice = await provider.getGasPrice();
  const targetGasFee = currentGasPrice.div(100).mul(GAS_PREMIUM);

  logger.trace(
    `Current gas price usage ${bnUtils.fromWei(
      targetGasFee.toString(),
      9,
    )} gwei`,
  );

  let mineTimes = 0;
  while (mineTimes < targetMineTimes) {
    let nonce = await miner.getTransactionCount();
    logger.trace(`nonce is ${nonce}`);
    const balance = await miner.getBalance();
    logger.trace(
      `balance is ${bnUtils.fromWei(balance.toString(), 18).dp(4).toString()}`,
    );

    const spinnies = new Spinnies();
    logger.trace(`The current mining difficulty is ${workc}`);
    spinnies.add("mining", { text: "start mining...", color: "blue" });
    await sleep(1000);
    let timer = Date.now(),
      startTimer = timer,
      mineCount = 0;

    let isMined = false;
    while (!isMined) {
      mineCount += 1;
      const callData = `data:application/json,{"p":"ierc-20","op":"mint","tick":"${tick}","amt":"${amt}","nonce":"${generateNonce()}${unique++}"}`;
      const transaction = {
        type: 2,
        chainId: network.chainId,
        to: account,
        maxPriorityFeePerGas: targetGasFee,
        maxFeePerGas: targetGasFee,
        gasLimit: ethers.BigNumber.from("86400"),
        nonce: nonce,
        value: ethers.utils.parseEther("0"),
        data: stringToHex(callData),
      };
      const rawTransaction = ethers.utils.serializeTransaction(transaction);
      const transactionHash = ethers.utils.keccak256(rawTransaction);

      const signingKey = miner._signingKey();
      const signature = signingKey.signDigest(transactionHash);

      const recreatedSignature = ethers.utils.joinSignature(signature);

      const predictedTransactionHash = ethers.utils.keccak256(
        ethers.utils.serializeTransaction(transaction, recreatedSignature),
      );

      const now = Date.now();
      if (now - timer > 100) {
        await sleep(1);
        spinnies.update("mining", {
          text: `[${dayjs(now).format(
            "YYYY-MM-DD HH:mm:ss",
          )}] ${mineCount} - ${predictedTransactionHash}`,
          color: "red",
        });
        timer = now;
      }

      if (predictedTransactionHash.includes(workc)) {
        unique = 0;
        spinnies.succeed("mining", {
          text: `${mineCount} - ${predictedTransactionHash}`,
          color: "green",
        });
        logger.info("mining", `${mineCount} - ${predictedTransactionHash}`);
        const mineTime = (Date.now() - startTimer) / 1000;
        logger.info(
          `Total time spent ${mineTime}s, average arithmetic ${Math.ceil(
            mineCount / mineTime,
          )} c/s`,
        );
        const realTransaction = await miner.sendTransaction(transaction);
        logger.info(`mining hash: ${realTransaction.hash}`);
        await realTransaction.wait();

        mineTimes += 1;
        nonce = await miner.getTransactionCount();
        mineCount = 0;
        logger.info("mining success");

        isMined = true;
      }
    }
  }
};
