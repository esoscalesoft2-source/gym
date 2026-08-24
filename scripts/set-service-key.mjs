/**
 * Puts a downloaded Firebase service account JSON into .env.local, base64 encoded.
 *
 *   node scripts/set-service-key.mjs "C:/Users/you/Downloads/your-key.json"
 *
 * Base64 rather than raw JSON because the private key contains \n escapes that
 * get mangled when a JSON blob is pasted into a .env file on Windows.
 * The key never leaves this machine — nothing is printed except a confirmation.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const KEY = "FIREBASE_SERVICE_ACCOUNT_KEY";
const envPath = resolve(process.cwd(), ".env.local");
const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error("Usage: node scripts/set-service-key.mjs <path-to-service-account.json>");
  process.exit(1);
}
if (!existsSync(jsonPath)) {
  console.error(`Not found: ${jsonPath}`);
  process.exit(1);
}
if (!existsSync(envPath)) {
  console.error("No .env.local in this folder. Copy .env.example to .env.local first.");
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(readFileSync(jsonPath, "utf8"));
} catch {
  console.error("That file is not valid JSON.");
  process.exit(1);
}

for (const field of ["project_id", "client_email", "private_key"]) {
  if (!parsed[field]) {
    console.error(`Not a service account key — "${field}" is missing.`);
    process.exit(1);
  }
}

const encoded = Buffer.from(JSON.stringify(parsed)).toString("base64");
const env = readFileSync(envPath, "utf8");
const line = `${KEY}=${encoded}`;

const updated = new RegExp(`^${KEY}=.*$`, "m").test(env)
  ? env.replace(new RegExp(`^${KEY}=.*$`, "m"), line)
  : `${env.trimEnd()}\n${line}\n`;

writeFileSync(envPath, updated);

console.log(`✓ ${KEY} written to .env.local`);
console.log(`  project_id:   ${parsed.project_id}`);
console.log(`  client_email: ${parsed.client_email}`);
console.log(`  Now restart the dev server.`);
