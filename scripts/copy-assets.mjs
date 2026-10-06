// Copies MathLive's fonts into /public so the math input field can load them.
// Runs automatically after `npm install` (see "postinstall" in package.json).
import fs from "node:fs";

fs.mkdirSync("public/mathlive", { recursive: true });
fs.cpSync("node_modules/mathlive/fonts", "public/mathlive/fonts", { recursive: true });
console.log("Copied MathLive fonts to public/mathlive/fonts");
