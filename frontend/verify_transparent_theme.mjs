import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 5202;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACTS_DIR = path.resolve("./test-artifacts");

const THEMES_TO_TEST = [
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
  console.log("=== STARTING GLOBAL TRANSPARENT THEME SYSTEM VERIFICATION ===");
  const preview = spawn("npx", ["vite", "preview", "--port", String(PORT)], {
    shell: true,
    stdio: "pipe",
  });

  await new Promise((r) => setTimeout(r, 2500));

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();

  const testReport = {
    themes: {},
    crossPageBackgroundVisible: {},
    defaultRestoration: {},
  };

  try {
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

    for (const theme of THEMES_TO_TEST) {
      await page.click(`button[data-theme-id="${theme.id}"]`);
      await page.waitForTimeout(300);

      const themeColor = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--theme-color").trim());
      const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim());
      const shellBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-shell")).backgroundImage);
      const sidebarBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-sidebar")).backgroundColor);
      const topbarBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-topbar")).backgroundColor);

      const hexMatches = toHex(themeColor) === theme.hex.toUpperCase();

      testReport.themes[theme.id] = {
        name: theme.name,
        expectedHex: theme.hex,
        actualThemeColor: toHex(themeColor),
        hexMatches,
        shellBg: shellBg.slice(0, 45),
        sidebarBg,
        topbarBg,
      };

      console.log(`Theme: ${theme.name.padEnd(12)} | Hex: ${toHex(themeColor)} (${hexMatches ? 'OK' : 'MISMATCH'}) | ShellBg: ${shellBg ? shellBg.slice(0, 30) : 'none'} | SidebarBg: ${sidebarBg}`);
    }

    // Select Beach theme and test transparent surfaces across all pages
    console.log("\nTesting Beach theme across pages...");
    await page.click('button[data-theme-id="beach"]');
    await page.waitForTimeout(400);

    const pages = ["/dashboard", "/chat", "/content", "/progress", "/history", "/settings"];
    for (const p of pages) {
      await page.goto(`${BASE_URL}${p}`);
      await page.waitForTimeout(400);

      const shellBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-shell")).backgroundImage);
      const mainBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-main")).backgroundColor);
      const sidebarBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-sidebar")).backgroundColor);
      const topbarBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-topbar")).backgroundColor);

      const hasBgImage = shellBg.includes("beach.jpg");
      testReport.crossPageBackgroundVisible[p] = {
        hasBgImage,
        mainBgTransparent: mainBg === "rgba(0, 0, 0, 0)" || mainBg === "transparent",
        sidebarBg,
        topbarBg,
      };

      console.log(`Page: ${p.padEnd(12)} -> ShellBg Has Image: ${hasBgImage} | MainBg: ${mainBg} | Sidebar: ${sidebarBg} | Topbar: ${topbarBg}`);
    }

    // Switch back to Default and verify clean restoration
    console.log("\nTesting Default restoration...");
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForTimeout(400);
    await page.click('button[data-theme-id="default"]');
    await page.waitForTimeout(400);

    const defaultShellBg = await page.evaluate(() => getComputedStyle(document.querySelector(".app-shell")).backgroundImage);
    const defaultShellBgColor = await page.evaluate(() => getComputedStyle(document.querySelector(".app-shell")).backgroundColor);
    const defaultAccent = toHex(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--app-accent").trim()));
    const defaultSidebarBg = toHex(await page.evaluate(() => getComputedStyle(document.querySelector(".app-sidebar")).backgroundColor));

    testReport.defaultRestoration = {
      shellBgIsNone: defaultShellBg === "none" || defaultShellBg === "",
      shellBgColor: defaultShellBgColor,
      accentMatches: defaultAccent === "#4F46E5",
      sidebarMatches: defaultSidebarBg === "#1A237E",
    };

    console.log("Default restoration:", JSON.stringify(testReport.defaultRestoration, null, 2));

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "transparent_theme_system.png"), fullPage: true });

    console.log("\n================ REPORT ================");
    console.log(JSON.stringify(testReport, null, 2));
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
    preview.kill("SIGINT");
    process.exit(0);
  }
}

run();
