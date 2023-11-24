import { program } from "commander";
import { runMine } from "./scripts/mine";

program.command("mine <tick>").action((tick) => {
  runMine(tick)
    .then()
    .catch((err) => {
      console.log(err);
    });
});

program.parse(process.argv);
