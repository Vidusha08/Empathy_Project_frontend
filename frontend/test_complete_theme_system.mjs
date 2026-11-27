import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 5192;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACTS_DIR = path.resolve("./test-artifacts");

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function run() {
  console.log("=== STARTING THEME SYSTEM ENHANCEMENT VERIFICATION ===");
  console.log(`Starting vite preview on port ${PORT}...`);

  const preview = spawn("npx", ["vite", "preview", "--port", String(PORT)], {
    shell: true,
    stdio: "pipe",
  });

  preview.stdout.on("data", (d) => console.log("[preview]", d.toString().trim()));
  preview.stderr.on("data", (d) => console.error("[preview err]", d.toString().trim()));

  // Wait for server to start
  await new Promise((r) => setTimeout(r, 2500));

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();

  const testReport = {
    allThemesDisplayed: false,
    themeCount: 0,
    themeCardsData: [],
    rainySelectionApplied: false,
    beachSelectionApplied: false,
    zenGardenSelectionApplied: false,
    pageNavigationBackgroundPersistence: false,
    refreshPersistence: false,
    audioMuteToggleFunctional: false,
  };

  try {
    // 1. Intercept APIs
    await page.route("**/api/content/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            skill_id: "calming_body_mind",
            title: "Calming the Body and Mind",
            description: "Learn body awareness and calming techniques.",
            summary: "Learn body awareness and calming techniques.",
            objectives: [],
          },
        ]),
      });
    });

    await page.route((url) => url.href.includes(":5000") && url.href.includes("progress"), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          overall_progress: 75,
          completed_items: 15,
          total_items: 20,
        }),
      });
    });

    // Seed mock login
    await page.goto(`${BASE_URL}/`);
    await page.evaluate(() => {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: {
            user: { role: "student", student_id: "STU-001", username: "Taylor Swift", name: "Taylor Swift" },
            token: "mock-token",
          },
          version: 0,
        })
      );
      // Clean previous app settings
      localStorage.removeItem("app-settings");
    });

    // Navigate to /settings
    console.log("1. Navigating to /settings...");
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector(".settings-theme-gallery");

    // Check all 10 themes exist
    const themeCards = await page.$$(".settings-theme-card");
    testReport.themeCount = themeCards.length;
    console.log(`Found ${themeCards.length} theme cards in gallery.`);

    for (const card of themeCards) {
      const themeId = await card.getAttribute("data-theme-id");
      const name = await card.$eval(".settings-theme-card__name", (el) => el.textContent.trim());
      const sound = await card.$eval(".settings-theme-card__sound span", (el) => el.textContent.trim());
      testReport.themeCardsData.push({ themeId, name, sound });
    }

    testReport.allThemesDisplayed = themeCards.length === 10;

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "01_settings_all_10_themes.png"), fullPage: true });

    // 2. Select Rainy Theme
    console.log("2. Selecting 'Rainy' theme...");
    await page.click('button[data-theme-id="rainy"]');
    await page.waitForTimeout(500);

    const rainyRootTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const rainyAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim());
    const rainyMainBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);

    console.log(`Rainy Theme: rootTheme=${rainyRootTheme}, accent=${rainyAccent}, bg=${rainyMainBg.slice(0, 50)}...`);
    if (rainyRootTheme === "rainy" && rainyAccent.toUpperCase() === "#718D9B" && rainyMainBg.includes("rainy_bg")) {
      testReport.rainySelectionApplied = true;
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "02_settings_rainy_selected.png"), fullPage: true });

    // 3. Test sound unmute toggle
    console.log("3. Toggling ambient sound unmute in Topbar...");
    const soundBtn = await page.$('.app-topbar button[title*="ambient sound"]');
    if (soundBtn) {
      await soundBtn.click();
      await page.waitForTimeout(300);
      const isMutedNow = await page.evaluate(() => {
        const store = JSON.parse(localStorage.getItem("app-settings") || "{}");
        return store?.state?.isMuted;
      });
      console.log(`After toggle sound: isMuted in localStorage = ${isMutedNow}`);
      testReport.audioMuteToggleFunctional = isMutedNow === false;
    }

    // 4. Select Beach Theme
    console.log("4. Selecting 'Beach' theme...");
    await page.click('button[data-theme-id="beach"]');
    await page.waitForTimeout(500);

    const beachRootTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const beachAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim());
    const beachMainBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);

    console.log(`Beach Theme: rootTheme=${beachRootTheme}, accent=${beachAccent}, bg=${beachMainBg.slice(0, 50)}...`);
    if (beachRootTheme === "beach" && beachAccent.toUpperCase() === "#64AEB5" && beachMainBg.includes("beach_bg")) {
      testReport.beachSelectionApplied = true;
    }

    // 5. Select Zen Garden Theme
    console.log("5. Selecting 'Zen Garden' theme...");
    await page.click('button[data-theme-id="zen_garden"]');
    await page.waitForTimeout(500);

    const zenRootTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const zenAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim());
    const zenMainBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);

    console.log(`Zen Garden Theme: rootTheme=${zenRootTheme}, accent=${zenAccent}, bg=${zenMainBg.slice(0, 50)}...`);
    if (zenRootTheme === "zen_garden" && zenAccent.toUpperCase() === "#A1A889" && zenMainBg.includes("zen_garden_bg")) {
      testReport.zenGardenSelectionApplied = true;
    }

    // 6. Navigate across pages: Dashboard, Chat, Progress
    console.log("6. Testing page navigation persistence to /dashboard...");
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(600);
    const dashBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);
    const dashAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim());
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "03_dashboard_zen_garden.png"), fullPage: true });

    console.log("Testing page navigation persistence to /chat...");
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForTimeout(600);
    const chatBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "04_chat_zen_garden.png"), fullPage: true });

    console.log("Testing page navigation persistence to /progress...");
    await page.goto(`${BASE_URL}/progress`);
    await page.waitForTimeout(600);
    const progBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "05_progress_zen_garden.png"), fullPage: true });

    if (dashBg.includes("zen_garden_bg") && chatBg.includes("zen_garden_bg") && progBg.includes("zen_garden_bg")) {
      testReport.pageNavigationBackgroundPersistence = true;
    }

    // 7. Full page refresh persistence
    console.log("7. Reloading page to test persistence...");
    await page.reload();
    await page.waitForTimeout(800);
    const reloadedTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const reloadedBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);
    console.log(`After reload: theme=${reloadedTheme}, bg=${reloadedBg.slice(0, 50)}...`);
    if (reloadedTheme === "zen_garden" && reloadedBg.includes("zen_garden_bg")) {
      testReport.refreshPersistence = true;
    }

    console.log("\n================ VERIFICATION SUMMARY ================");
    console.log(JSON.stringify(testReport, null, 2));

  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    await browser.close();
    preview.kill("SIGINT");
    process.exit(0);
  }
}

run();
