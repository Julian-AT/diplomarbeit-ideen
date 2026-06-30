import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const suggestions = [
  "Finde 5 Diplomarbeit-Ideen zu KI und Schule, mit direkten Archiv-Belegen.",
  "Welche bestehenden Projekte eignen sich am besten für eine moderne Erweiterung?",
  "Baue auf dem Projekt Airchif auf und nenne konkrete nächste Schritte.",
  "Vergleiche ähnliche Archiv-Projekte und schlage ein realistisches Thema vor.",
];
