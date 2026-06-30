import { expect, test } from "@playwright/test";

const requiresCloud = process.env.E2E_FULL_CLOUD !== "1";

test.describe("thesis ideation flows", () => {
  // biome-ignore lint/suspicious/noSkippedTests: Full thesis flows require cloud credentials and live model access.
  test.skip(
    requiresCloud,
    "Requires configured auth, model, retrieval, and corpus credentials."
  );

  test("spark-to-ideas flow produces grounded prior-work output", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByTestId("multimodal-input")
      .fill(
        "I like AI in education. Propose three diploma thesis ideas grounded in prior archive work."
      );
    await page.getByTestId("send-button").click();

    await expect(
      page.getByText(/prior work|citation|source path|thesis/i).first()
    ).toBeVisible({
      timeout: 60_000,
    });
  });

  test("build-on-top flow requests extensions for a selected prior thesis", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByTestId("multimodal-input")
      .fill(
        "Build on top of the Airchif thesis. Suggest feasible extensions and cite the archive evidence."
      );
    await page.getByTestId("send-button").click();

    await expect(
      page.getByText(/extension|build|source path|Airchif/i).first()
    ).toBeVisible({
      timeout: 60_000,
    });
  });
  test("proposal artifact can be created and revised", async ({ page }) => {
    await page.goto("/");
    await page
      .getByTestId("multimodal-input")
      .fill(
        "Create a cited thesis proposal artifact about AI-assisted feedback, grounded in the prior archive."
      );
    await page.getByTestId("send-button").click();

    await expect(page.getByTestId("artifact")).toBeVisible({ timeout: 90_000 });
    await expect(
      page.getByText(/related prior work|references|research question/i).first()
    ).toBeVisible({ timeout: 90_000 });

    await page
      .getByTestId("multimodal-input")
      .fill("Revise the proposal to tighten scope and keep citations intact.");
    await page.getByTestId("send-button").click();

    await expect(page.getByText(/v2|Updated/i).first()).toBeVisible({
      timeout: 90_000,
    });
  });
});
