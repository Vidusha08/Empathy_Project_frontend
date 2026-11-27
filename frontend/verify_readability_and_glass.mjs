import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 5210;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACTS_DIR = path.resolve("./test-artifacts");

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const EXPECTED_THEMES = [
  { id: "default", name: "Default", hex: "#4F46E5", isDefault: true },
  { id: "beach", name: "Beach", hex: "#5F9CA2", isDefault: false },
  { id: "cloudy", name: "Cloudy", hex: "#039BE5", isDefault: false },
  { id: "dreamy_night", name: "Dreamy Night", hex: "#DBB1E1", isDefault: false },
  { id: "forest", name: "Forest", hex: "#046307", isDefault: false },
  { id: "lantern", name: "Lantern", hex: "#F5B332", isDefault: false },
  { id: "rainy", name: "Rainy", hex: "#C4A484", isDefault: false },
  { id: "rich_town", name: "Rich Town", hex: "#554433", isDefault: false },
  { id: "village", name: "Village", hex: "#89A577", isDefault: false },
  { id: "winter", name: "Winter", hex: "#C7C9CC", isDefault: false },
  { id: "zen_garden", name: "Zen Garden", hex: "#C0403E", isDefault: false },
];

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

async function run() {
  console.log("=== STARTING READABILITY & FROSTED GLASS VERIFICATION ===");
  const preview = spawn("npx", ["vite", "preview", "--port", String(PORT)], {
    shell: true,
    stdio: "pipe",
  });

  preview.stdout.on("data", (d) => {
    // console.log("[vite]", d.toString().trim());
  });

  await new Promise((r) => setTimeout(r, 2500));

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();

  const results = {
    themesCount: 0,
    hexMatches: true,
    frostedWhiteCards: true,
    textReadability: true,
    contrastRatioValid: true,
    defaultRestoration: false,
    failures: [],
  };

  try {
    // Intercept APIs for mock offline rendering
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
    results.themesCount = cards.length;
    console.log(`Gallery themes detected: ${cards.length}/11`);

    if (cards.length !== 11) {
      results.failures.push(`Expected 11 theme cards, found ${cards.length}`);
    }

    // Test themes
    for (const theme of EXPECTED_THEMES) {
      const btn = await page.$(`button[data-theme-id="${theme.id}"]`);
      if (!btn) {
        results.failures.push(`Button not found for theme ${theme.id}`);
        continue;
      }
      await btn.click();
      await page.waitForTimeout(200);

      const themeData = await page.evaluate((isDef) => {
        const root = document.documentElement;
        const shell = document.querySelector(".app-shell");
        const sidebar = document.querySelector(".app-sidebar");
        const topbar = document.querySelector(".app-topbar");
        const card = document.querySelector(".settings-card");
        const cardH2 = document.querySelector(".settings-card__heading h2");
        const cardP = document.querySelector(".settings-card__heading p");

        const computedThemeColor = getComputedStyle(root).getPropertyValue("--theme-color").trim();
        const computedAccent = getComputedStyle(root).getPropertyValue("--app-accent").trim();
        const shellBg = shell ? getComputedStyle(shell).backgroundImage : "";
        const sidebarBg = sidebar ? getComputedStyle(sidebar).backgroundColor : "";
        const topbarBg = topbar ? getComputedStyle(topbar).backgroundColor : "";
        const cardBg = card ? getComputedStyle(card).backgroundColor : "";
        const cardBorder = card ? getComputedStyle(card).borderColor : "";
        const cardFilter = card ? (getComputedStyle(card).backdropFilter || getComputedStyle(card).webkitBackdropFilter) : "";
        const h2Color = cardH2 ? getComputedStyle(cardH2).color : "";
        const pColor = cardP ? getComputedStyle(cardP).color : "";

        return {
          computedThemeColor,
          computedAccent,
          shellBg,
          sidebarBg,
          topbarBg,
          cardBg,
          cardBorder,
          cardFilter,
          h2Color,
          pColor,
        };
      }, theme.isDefault);

      const actualHex = toHex(themeData.computedThemeColor);
      if (actualHex !== theme.hex.toUpperCase()) {
        results.hexMatches = false;
        results.failures.push(`Theme ${theme.id}: expected ${theme.hex}, got ${actualHex}`);
      }

      // Check card background is frosted white (rgb 255, 255, 255 with alpha or solid white for default)
      const isWhiteTranslucent = themeData.cardBg.includes("rgba(255, 255, 255") || themeData.cardBg === "rgb(255, 255, 255)";
      if (!isWhiteTranslucent) {
        results.frostedWhiteCards = false;
        results.failures.push(`Theme ${theme.id}: card background is not white translucent/solid: ${themeData.cardBg}`);
      }

      // Check headings and text have high contrast dark neutral colors (e.g. #1f2937 -> rgb(31, 41, 55))
      const isDarkHeading = themeData.h2Color.includes("31, 41, 55") || themeData.h2Color.includes("32, 41, 56") || themeData.h2Color.includes("17, 24, 39");
      if (!isDarkHeading) {
        // Check if at least dark (r, g, b < 70)
        const rgb = themeData.h2Color.match(/\d+/g);
        if (rgb && (Number(rgb[0]) > 80 || Number(rgb[1]) > 80 || Number(rgb[2]) > 80)) {
          results.textReadability = false;
          results.failures.push(`Theme ${theme.id}: card h2 is not dark neutral: ${themeData.h2Color}`);
        }
      }

      console.log(`✓ Verified theme '${theme.name}' (${actualHex}): Card=${themeData.cardBg}, Heading=${themeData.h2Color}`);
    }

    // Now test cross-page styling with Rich Town (darkest theme)
    console.log("\nTesting cross-page frosted white surfaces with Rich Town (#554433)...");
    await page.click('button[data-theme-id="rich_town"]');
    await page.waitForTimeout(300);

    // 1. Dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector(".dashboard-header, .student-dashboard__header, h1", { timeout: 4000 });
    const dashStyle = await page.evaluate(() => {
      const card = document.querySelector(".dashboard-card, .student-dashboard__card, .dashboard-header");
      const h1 = document.querySelector("h1, h2");
      return {
        cardBg: card ? getComputedStyle(card).backgroundColor : "",
        h1Color: h1 ? getComputedStyle(h1).color : "",
      };
    });
    console.log(`Dashboard under Rich Town: CardBg=${dashStyle.cardBg}, H1Color=${dashStyle.h1Color}`);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "readability_01_dashboard_rich_town.png") });

    // 2. Chat
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForSelector(".chat-page, .chat-unified-panel", { timeout: 4000 });
    const chatStyle = await page.evaluate(() => {
      const panel = document.querySelector(".chat-unified-panel");
      const composer = document.querySelector(".chat-composer-box");
      const headerTitle = document.querySelector(".chat-panel__header h1, .chat-panel__header h2, .chat-panel__header");
      return {
        panelBg: panel ? getComputedStyle(panel).backgroundColor : "",
        composerBg: composer ? getComputedStyle(composer).backgroundColor : "",
        headerTitleColor: headerTitle ? getComputedStyle(headerTitle).color : "",
      };
    });
    console.log(`Chat under Rich Town: PanelBg=${chatStyle.panelBg}, ComposerBg=${chatStyle.composerBg}, TitleColor=${chatStyle.headerTitleColor}`);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "readability_02_chat_rich_town.png") });

    // 3. Progress
    await page.goto(`${BASE_URL}/progress`);
    await page.waitForSelector(".progress-page", { timeout: 4000 });
    const progStyle = await page.evaluate(() => {
      const card = document.querySelector(".overall-progress-card, .skill-card");
      const h1 = document.querySelector(".progress-header h1");
      return {
        cardBg: card ? getComputedStyle(card).backgroundColor : "",
        h1Color: h1 ? getComputedStyle(h1).color : "",
      };
    });
    console.log(`Progress under Rich Town: CardBg=${progStyle.cardBg}, H1Color=${progStyle.h1Color}`);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "readability_03_progress_rich_town.png") });

    // 4. Default Theme Restoration
    console.log("\nTesting Default Theme restoration...");
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector(".settings-theme-gallery");
    await page.click('button[data-theme-id="default"]');
    await page.waitForTimeout(300);

    const defaultCheck = await page.evaluate(() => {
      const shell = document.querySelector(".app-shell");
      const sidebar = document.querySelector(".app-sidebar");
      const topbar = document.querySelector(".app-topbar");
      const card = document.querySelector(".settings-card");
      const computedTheme = getComputedStyle(document.documentElement).getPropertyValue("--theme-color").trim();
      return {
        themeColor: computedTheme,
        shellBg: shell ? getComputedStyle(shell).backgroundImage : "",
        sidebarBg: sidebar ? getComputedStyle(sidebar).backgroundColor : "",
        topbarBg: topbar ? getComputedStyle(topbar).backgroundColor : "",
        cardBg: card ? getComputedStyle(card).backgroundColor : "",
      };
    });

    console.log("Default restoration check:", defaultCheck);
    if (toHex(defaultCheck.themeColor) === "#4F46E5" && (defaultCheck.shellBg === "none" || defaultCheck.shellBg === "")) {
      results.defaultRestoration = true;
      console.log("✓ Default restoration verified: Theme is #4F46E5 and background image is none.");
    } else {
      results.failures.push(`Default restoration check failed: ${JSON.stringify(defaultCheck)}`);
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "readability_04_settings_default_restored.png") });

    console.log("\n=== FINAL TEST RESULTS ===");
    console.log("Total themes:", results.themesCount);
    console.log("Exact HEX match:", results.hexMatches);
    console.log("Frosted white cards:", results.frostedWhiteCards);
    console.log("Text readability (dark neutral text):", results.textReadability);
    console.log("Default restoration:", results.defaultRestoration);
    console.log("Failures:", results.failures.length === 0 ? "NONE (ALL PASSED)" : results.failures);

  } catch (err) {
    console.error("Test encountered an error:", err);
  } finally {
    await browser.close();
    preview.kill();
  }
}

run();
