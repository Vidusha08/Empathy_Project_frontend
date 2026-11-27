import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 5198;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACTS_DIR = path.resolve("./test-artifacts");

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

// Expected 11 themes with their EXACT HEX colours
const EXPECTED_THEMES = [
  { themeId: "default", name: "Default", hex: "#4F46E5", bg: "none", sound: "/sounds/default.mp3.mp3" },
  { themeId: "beach", name: "Beach", hex: "#5F9CA2", bg: "beach.jpg", sound: "/sounds/beach.mp3.mp3" },
  { themeId: "cloudy", name: "Cloudy", hex: "#039BE5", bg: "cloudy.jpg", sound: "/sounds/cloudy.mp3.mp3" },
  { themeId: "dreamy_night", name: "Dreamy Night", hex: "#DBB1E1", bg: "dreamy-night.jpg", sound: "/sounds/dreamy-night.mp3.mp3" },
  { themeId: "forest", name: "Forest", hex: "#046307", bg: "forest.jpg", sound: "/sounds/forest.mp3.mp3" },
  { themeId: "lantern", name: "Lantern", hex: "#F5B332", bg: "lantern.jpg", sound: "/sounds/lantern.mp3.mp3" },
  { themeId: "rainy", name: "Rainy", hex: "#C4A484", bg: "rainy.jpg", sound: "/sounds/rainy.mp3.mp3" },
  { themeId: "rich_town", name: "Rich Town", hex: "#554433", bg: "rich-town.jpg", sound: "/sounds/rich-town.mp3.mp3" },
  { themeId: "village", name: "Village", hex: "#89A577", bg: "village.jpg", sound: "/sounds/village.mp3.mp3" },
  { themeId: "winter", name: "Winter", hex: "#C7C9CC", bg: "winter.jpg", sound: "/sounds/winter.mp3.mp3" },
  { themeId: "zen_garden", name: "Zen Garden", hex: "#C0403E", bg: "zen-garden.jpg", sound: "/sounds/zen-garden.mp3.mp3" },
];

async function run() {
  console.log("=== STARTING 11-THEME SYSTEM VERIFICATION ===");
  console.log(`Starting preview server on port ${PORT}...`);

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

  const report = {
    totalThemesCount: 0,
    all11ThemesVerified: true,
    themeDetails: {},
    defaultRestorationVerified: false,
    persistenceVerified: false,
    crossPageNavigationVerified: false,
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

    // Authenticate
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

    console.log("1. Navigating to /settings...");
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector(".settings-theme-gallery");

    const cards = await page.$$(".settings-theme-card");
    report.totalThemesCount = cards.length;
    console.log(`Found ${cards.length} theme cards in gallery.`);

    // Helper to convert rgb(...) or #... to uppercase 6-digit hex
    function toHex(color) {
      if (!color) return "";
      if (color.startsWith("#")) {
        const hex = color.slice(1);
        if (hex.length === 3) {
          return ("#" + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]).toUpperCase();
        }
        return color.toUpperCase();
      }
      const rgb = color.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        return (
          "#" +
          ((1 << 24) + (Number(rgb[0]) << 16) + (Number(rgb[1]) << 8) + Number(rgb[2]))
            .toString(16)
            .slice(1)
            .toUpperCase()
        );
      }
      return color.toUpperCase();
    }

    // 2. Test each theme individually
    for (const expected of EXPECTED_THEMES) {
      console.log(`\nVerifying theme: ${expected.name} (${expected.themeId})...`);
      const btn = await page.$(`button[data-theme-id="${expected.themeId}"]`);
      if (!btn) {
        console.error(`Theme card button for ${expected.themeId} not found!`);
        report.all11ThemesVerified = false;
        continue;
      }
      await btn.click();
      await page.waitForTimeout(300);

      const rootTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      const rawAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim());
      const accentHex = toHex(rawAccent);
      const mainBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);

      const hexMatches = accentHex === expected.hex.toUpperCase();
      const bgMatches = expected.bg === "none"
        ? (mainBg === "none" || mainBg === "")
        : mainBg.includes(expected.bg);

      // Verify audio HTTP status
      const audioResp = await page.request.get(`${BASE_URL}${expected.sound}`);
      const audioStatus = audioResp.status();

      report.themeDetails[expected.themeId] = {
        name: expected.name,
        expectedHex: expected.hex,
        actualHex: accentHex,
        hexMatches,
        bgMatches,
        mainBg: mainBg ? mainBg.slice(0, 60) : "none",
        audioStatus,
      };

      console.log(`  Hex: ${accentHex} (expected ${expected.hex}) => ${hexMatches ? "PASS" : "FAIL"}`);
      console.log(`  Background: ${mainBg ? mainBg.slice(0, 50) : "none"} => ${bgMatches ? "PASS" : "FAIL"}`);
      console.log(`  Audio (${expected.sound}) => HTTP ${audioStatus}`);

      if (!hexMatches || !bgMatches || audioStatus !== 200) {
        report.all11ThemesVerified = false;
      }
    }

    // 3. Switch to custom theme (Lantern), then switch to Default to verify clean restoration
    console.log("\n3. Testing clean restoration from custom theme to 'Default'...");
    await page.click('button[data-theme-id="lantern"]');
    await page.waitForTimeout(400);

    // Now switch back to Default
    await page.click('button[data-theme-id="default"]');
    await page.waitForTimeout(400);

    const defaultTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const defaultAccent = toHex(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim()));
    const defaultBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);
    const defaultSidebarBg = toHex(await page.evaluate(() => getComputedStyle(document.querySelector(".app-sidebar")).backgroundColor));

    console.log(`Restored Default Theme: rootTheme=${defaultTheme}, accent=${defaultAccent}, bg=${defaultBg}, sidebarBg=${defaultSidebarBg}`);

    if (
      defaultTheme === "default" &&
      defaultAccent === "#4F46E5" &&
      (defaultBg === "none" || defaultBg === "") &&
      defaultSidebarBg === "#1A237E"
    ) {
      report.defaultRestorationVerified = true;
      console.log("Clean default restoration: PASS");
    }

    // 4. Persistence after reload
    console.log("\n4. Testing persistence after reload...");
    await page.click('button[data-theme-id="rainy"]');
    await page.waitForTimeout(400);
    await page.reload();
    await page.waitForTimeout(800);

    const persistedTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const persistedAccent = toHex(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim()));
    const persistedBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);

    console.log(`After reload: theme=${persistedTheme}, accent=${persistedAccent}`);
    if (persistedTheme === "rainy" && persistedAccent === "#C4A484" && persistedBg.includes("rainy.jpg")) {
      report.persistenceVerified = true;
      console.log("Persistence after reload: PASS");
    }

    // 5. Cross-page navigation with theme applied
    console.log("\n5. Testing cross-page navigation...");
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForTimeout(400);
    const chatAccent = toHex(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim()));
    const chatBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(400);
    const dashAccent = toHex(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim()));
    const dashBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundImage);

    if (chatAccent === "#C4A484" && chatBg.includes("rainy.jpg") && dashAccent === "#C4A484" && dashBg.includes("rainy.jpg")) {
      report.crossPageNavigationVerified = true;
      console.log("Cross-page navigation: PASS");
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "11_themes_verified.png"), fullPage: true });

    console.log("\n================ TEST SUMMARY ================");
    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
    preview.kill("SIGINT");
    process.exit(0);
  }
}

run();
