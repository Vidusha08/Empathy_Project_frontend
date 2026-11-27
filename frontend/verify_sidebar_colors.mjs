import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 5199;
const BASE_URL = `http://localhost:${PORT}`;

const THEMES_TO_CHECK = [
  { id: "default", name: "Default", expectedSidebar: "#1A237E" },
  { id: "beach", name: "Beach", expectedSidebar: "#5F9CA2" },
  { id: "cloudy", name: "Cloudy", expectedSidebar: "#039BE5" },
  { id: "dreamy_night", name: "Dreamy Night", expectedSidebar: "#DBB1E1" },
  { id: "forest", name: "Forest", expectedSidebar: "#046307" },
  { id: "lantern", name: "Lantern", expectedSidebar: "#F5B332" },
  { id: "rainy", name: "Rainy", expectedSidebar: "#C4A484" },
  { id: "rich_town", name: "Rich Town", expectedSidebar: "#554433" },
  { id: "village", name: "Village", expectedSidebar: "#89A577" },
  { id: "winter", name: "Winter", expectedSidebar: "#C7C9CC" },
  { id: "zen_garden", name: "Zen Garden", expectedSidebar: "#C0403E" },
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
  console.log("=== VERIFYING SIDEBAR COLOR SWITCHING ===");
  const preview = spawn("npx", ["vite", "preview", "--port", String(PORT)], {
    shell: true,
    stdio: "pipe",
  });

  await new Promise((r) => setTimeout(r, 2500));

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();

  const results = {};

  try {
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
    });

    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector(".settings-theme-gallery");

    for (const theme of THEMES_TO_CHECK) {
      await page.click(`button[data-theme-id="${theme.id}"]`);
      await page.waitForTimeout(300);

      const actualSidebarColor = toHex(
        await page.evaluate(() => getComputedStyle(document.querySelector(".app-sidebar")).backgroundColor)
      );

      const match = actualSidebarColor === theme.expectedSidebar;
      results[theme.id] = {
        name: theme.name,
        expected: theme.expectedSidebar,
        actual: actualSidebarColor,
        match,
      };

      console.log(`Theme: ${theme.name.padEnd(14)} -> Sidebar: ${actualSidebarColor} (Expected: ${theme.expectedSidebar}) => ${match ? "PASS" : "FAIL"}`);
    }

    console.log("\nSummary:", JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
    preview.kill("SIGINT");
    process.exit(0);
  }
}

run();
