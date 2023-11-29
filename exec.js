const { exec } = require("child_process");

const wallets = require("./wallet.json");
const numThreads = wallets.length;
const tickerParam = "ierc-m6";

for (let i = 0; i < numThreads; i++) {
  const command = `yarn cli mine ${tickerParam} ${i}`;
  console.log(`执行命令: ${command}`);

  const childProcess = exec(command);

  // 监听子进程的输出和退出事件（可选）
  childProcess.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  childProcess.stderr.on("data", (data) => {
    console.error(`${data}`);
  });

  childProcess.on("exit", (code) => {
    console.log(`子进程退出，退出码：${code}`);
  });
}
