import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import {
  isPlaceholderValue,
  projectEnvKeys,
  validateProjectEnv,
} from "../lib/env/project";

function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function shouldShowHelp(): boolean {
  return process.argv.includes("--help") || process.argv.includes("-h");
}

function printHelp() {
  console.log(`Usage: pnpm env:check [--example] [--allow-placeholders] [--env-file <path>]

Options:
  --example              Validate .env.example and allow placeholder secrets.
  --allow-placeholders   Allow placeholder values while still checking required keys.
  --env-file <path>      Load a specific env file before validation.
`);
}

if (shouldShowHelp()) {
  printHelp();
  process.exit(0);
}

const useExample = process.argv.includes("--example");
const allowPlaceholders =
  useExample || process.argv.includes("--allow-placeholders");
const explicitEnvFile = readArg("--env-file");
const defaultEnvFile = existsSync(path.resolve(process.cwd(), ".env.local"))
  ? ".env.local"
  : ".env";
const envFile =
  explicitEnvFile ?? (useExample ? ".env.example" : defaultEnvFile);
const envPath = path.resolve(process.cwd(), envFile);

if (existsSync(envPath)) {
  config({ path: envPath, override: true });
  console.log(`Loaded ${envFile}`);
} else if (explicitEnvFile || useExample) {
  console.error(`Missing env file: ${envFile}`);
  process.exit(1);
} else {
  console.log("No .env.local file found; validating process environment only.");
}

const result = validateProjectEnv(process.env, { allowPlaceholders });

console.log("\nEnvironment contract:");
for (const key of projectEnvKeys) {
  const value = process.env[key];
  const status = value?.trim()
    ? isPlaceholderValue(value)
      ? "placeholder"
      : "set"
    : "missing";
  console.log(`- ${key}: ${status}`);
}

if (result.issues.length > 0) {
  console.log("\nIssues:");
  for (const issue of result.issues) {
    console.log(
      `- ${issue.level.toUpperCase()} ${issue.key}: ${issue.message}`
    );
  }
}

if (!result.ok) {
  console.error("\nEnvironment validation failed.");
  process.exit(1);
}

console.log("\nEnvironment validation passed.");
