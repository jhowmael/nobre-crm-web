import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, process.env.OPENAPI_SOURCE || "../nobre-crm-api/openapi.json");
const target = resolve(root, "src/api/schema.ts");

const document = JSON.parse(await readFile(source, "utf8"));
const ast = await openapiTS(document, { enum: true, dedupeEnums: true, alphabetize: true });
await mkdir(dirname(target), { recursive: true });
await writeFile(target, astToString(ast));
console.log(`Tipos gerados em src/api/schema.ts a partir de ${source}`);
