// Lance le serveur de tuiles le temps d'exécuter une commande (studio, still…).
import { spawn } from "node:child_process";
import { start } from "./tileserver.mjs";
const server = await start();
const [cmd, ...args] = process.argv.slice(2);
const child = spawn("npx", [cmd, ...args], { stdio: "inherit" });
child.on("exit", (code) => { server.close(); process.exit(code ?? 0); });
