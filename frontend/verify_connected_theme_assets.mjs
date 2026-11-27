import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 5195;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACTS_DIR = path.resolve("./test-artifacts");

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function run() {
  console.log("=== STARTING THEME ASSET VERIFICATION ===");
  console.log(`Starting vite preview on port ${PORT}...`);

  const preview = spawn("npx", ["vite", "preview", "--port", String(PORT)], {
    shell: true,
    stdio: "pipe",
  });

  preview.stdout.on("data", (d) => console.log("[preview]", d.toString().trim()));
  preview.stderr.on("data", (d) => console.error("[preview err]", d.toString().trim()));

  await new Promise((r) => setTimeout(r, 2500));

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();

  const testResults = {
    allThemesDisplayed: false,
    themesFound: [],
    themeAssetStatus: {},
    pageNavigationBackgrounds: {},
  };

  try {
    // Intercept APIs for clean offline preview
    await page.route("**/api/content/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { skill_id: "calming_body_mind", title: "Calming the Body", summary: "Learn calming." }
        ]),
      });
    });

    await page.route((url) => url.href.includes(":5000") && url.href.includes("progress"), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ overall_progress: 80, completed_items: 8, total_items: 10 }),
      });
    });

    // Seed student login
    await page.goto(`${BASE_URL}/`);
    await page.evaluate(() => {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: {
            user: { role: "student", student_id: "STU-001", username: "Alex Chen", name: "Alex Chen" },
            token: "mock-token",
          },
          version: 0,
        })
      );
    });

    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector(".settings-theme-gallery");

    const cards = await page.$$(".settings-theme-card");
    console.log(`Rendered ${cards.length} theme cards in Settings.`);
    testResults.allThemesDisplayed = cards.length === 10;

    for (const card of cards) {
      const id = await card.getAttribute("data-theme-id");
      const name = await card.$eval(".settings-theme-card__name", (el) => el.textContent.trim());
      testResults.themesFound.push({ id, name });
    }

    // Verify each of the 10 themes
    for (const { id, name } of testResults.themesFound) {
      console.log(`\nTesting theme: ${name} (${id})...`);
      await page.click(`button[data-theme-id="${id}"]`);
      await page.waitForTimeout(400);

      const rootTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim());
      const mainBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);

      // Check HTTP status of background image
      const bgUrlMatch = mainBg.match(/url\(["']?([^"']+)["']?\)/);
      let imgHttpStatus = 0;
      if (bgUrlMatch) {
        const fullUrl = bgUrlMatch[1].startsWith("http") ? bgUrlMatch[1] : `${BASE_URL}${bgUrlMatch[1]}`;
        const resp = await page.request.get(fullUrl);
        imgHttpStatus = resp.status();
      }

      // Check HTTP status of ambient sound
      const audioUrl = await page.evaluate((themeId) => {
        // Find theme config
        return `/sounds/${themeId === 'rich_town' ? 'rich-town' : (themeId === 'zen_garden' ? 'zen-garden' : (themeId === 'dreamy_night' ? 'dreamy-night' : themeId))}.mp3.mp3`;
      }, id);
      const audioResp = await page.request.get(`${BASE_URL}${audioUrl}`);

      testResults.themeAssetStatus[id] = {
        name,
        accent,
        bgUrl: bgUrlMatch ? bgUrlMatch[1] : null,
        imgHttpStatus,
        audioUrl,
        audioHttpStatus: audioResp.status(),
      };

      console.log(`  -> Accent: ${accent}`);
      console.log(`  -> Background: ${bgUrlMatch ? bgUrlMatch[1] : 'none'} (HTTP ${imgHttpStatus})`);
      console.log(`  -> Audio: ${audioUrl} (HTTP ${audioResp.status()})`);
    }

    // Select Lantern theme and test global page navigation
    console.log("\nTesting global page navigation with 'Lantern' theme...");
    await page.click('button[data-theme-id="lantern"]');
    await page.waitForTimeout(400);

    const pagesToTest = ["/dashboard", "/chat", "/content", "/progress", "/history", "/settings"];
    for (const p of pagesToTest) {
      await page.goto(`${BASE_URL}${p}`);
      await page.waitForTimeout(400);
      const bg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);
      testResults.pageNavigationBackgrounds[p] = bg.includes("lantern.jpg");
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "settings_10_themes_connected.png"), fullPage: true });

    console.log("\n================ SUMMARY ================");
    console.log(JSON.stringify(testResults, null, 2));

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
    preview.kill("SIGINT");
    process.exit(0);
  }
}

run();
