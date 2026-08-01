import { build } from "esbuild";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));

await build({
    entryPoints: ["src/AlguienClient.ts"],
    outfile: "dist/AlguienClient.user.js",
    bundle: true,
    format: "iife",
    target: "es2020",
    banner: {
        js: `// ==UserScript==
// @name         Alguien Client - Survev.io Client
// @namespace    https://github.com/SoyAlguien0/AlguienClient
// @version      ${packageJson.version}
// @description  A client to enhance the survev.io in-game experience with many features, as well as future features.
// @author       SoyAlguien
// @license      AGPL-3.0
// @run-at       document-end
// @match        *://survev.io/*
// @match        *://66.179.254.36/*
// @match        *://expandedwater.online/*
// @grant        none
// @downloadURL  https://update.greasyfork.org/scripts/519982/Alguien%20Client%20-%20Survevio%20Client.user.js
// @updateURL    https://update.greasyfork.org/scripts/519982/Alguien%20Client%20-%20Survevio%20Client.meta.js
// ==/UserScript==
;`,
    },
});
