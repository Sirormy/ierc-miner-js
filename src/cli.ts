import { program } from "commander";
import { runMine } from "./scripts/mine";

program.command("mine <tick> <accountIndex>").action((tick, accountIndex) => {
  runMine(tick, Number(accountIndex))
    .then()
    .catch((err) => {
      console.log(err);
    });
});

program.parse(process.argv);
