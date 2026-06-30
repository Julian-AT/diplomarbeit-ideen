import { existsSync } from "node:fs";
import { config } from "dotenv";
import postgres from "postgres";
import { validateProjectEnv } from "../lib/env/project";
import {
  countCollectionPoints,
  createQdrantClientFromEnv,
} from "../lib/retrieval/qdrant";
import { searchPriorWorkRecords } from "../lib/retrieval/service";

config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function checkPostgres(url: string) {
  const sql = postgres(url, { max: 1 });
  try {
    await sql`select 1`;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function main() {
  const minPoints = Number(readArg("--min-points") ?? 1);
  const validation = validateProjectEnv(process.env);

  if (!validation.ok || !validation.env) {
    console.error("Environment validation failed.");
    for (const issue of validation.issues) {
      console.error(
        `- ${issue.level.toUpperCase()} ${issue.key}: ${issue.message}`
      );
    }
    process.exit(1);
  }

  await checkPostgres(validation.env.POSTGRES_URL);

  const qdrant = createQdrantClientFromEnv(process.env);
  await qdrant.getCollection(validation.env.QDRANT_COLLECTION);
  const pointCount = await countCollectionPoints(
    qdrant,
    validation.env.QDRANT_COLLECTION
  );

  if (pointCount < minPoints) {
    throw new Error(
      `Qdrant collection ${validation.env.QDRANT_COLLECTION} has ${pointCount} points; expected at least ${minPoints}.`
    );
  }

  const smokeQueries = [
    "Diplomarbeit Idee KI Schule",
    "Erweiterung bestehende Diplomarbeit Ausblick",
  ];
  const retrieval: Array<{ query: string; source: string; results: number }> =
    [];

  for (const query of smokeQueries) {
    const result = await searchPriorWorkRecords({ query, limit: 3 });
    retrieval.push({
      query,
      source: result.source,
      results: result.results.length,
    });
    if (result.source !== "qdrant" || result.results.length === 0) {
      throw new Error(`Retrieval smoke query failed: ${query}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        env: "ok",
        postgres: "ok",
        qdrant: {
          collection: validation.env.QDRANT_COLLECTION,
          points: pointCount,
        },
        retrieval,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
