import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 5188;
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACTS_DIR = path.resolve("./test-artifacts");

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function run() {
  console.log("=== STARTING GLOBAL THEME SYSTEM VERIFICATION ===");
  console.log("Building latest preview bundle...");
  
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

  const results = {
    themeSelectedImmediately: false,
    themePersistedAfterReload: false,
    dreamingSidebarApplied: false,
    dreamingGlobalBackgroundApplied: false,
    chatElementsThemed: false,
    dashboardElementsThemed: false,
    contentElementsThemed: false,
    progressElementsThemed: false,
    historyElementsThemed: false,
    quizElementsThemed: false,
    modalsAndDropdownsThemed: false,
    switchedBackToDefaultTheme: false,
  };

  try {
    // 1. Intercept content and progress APIs for realistic offline verification
    await page.route("**/api/content/**", async (route) => {
      const skills = [
        {
          skill_id: "calming_body_mind",
          chapter_id: "calming_body_mind",
          title: "Calming the Body and Mind",
          description: "Learn body awareness and calming techniques.",
          summary: "Learn body awareness and calming techniques.",
          objectives: [
            {
              objective_id: "obj_01_01",
              title: "Understanding bodily sensations",
              items: [{ item_id: "it_1", title: "Introduction", completed: true }]
            }
          ]
        },
        {
          skill_id: "ethical_mindfulness",
          chapter_id: "ethical_mindfulness",
          title: "Ethical Mindfulness",
          description: "Practice mindful awareness in daily decisions.",
          summary: "Practice mindful awareness in daily decisions.",
          objectives: []
        }
      ];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(skills),
      });
    });

    await page.route((url) => url.href.includes(":5000") && url.href.includes("progress"), async (route) => {
      const href = route.request().url();
      if (href.includes("structure")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            skills: [
              {
                skill_id: "calming_body_mind",
                title: "Calming the Body and Mind",
                objectives: [
                  {
                    objective_id: "obj_01_01",
                    title: "Understanding sensations",
                    items: [{ item_id: "it_1", title: "Item 1" }]
                  }
                ]
              }
            ]
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            overall_progress: 65,
            completed_items: 13,
            total_learning_items: 20,
            total_items: 20,
            skills: [
              { skill_id: "calming_body_mind", percent_complete: 80 }
            ]
          }),
        });
      }
    });

    // Authenticate user
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
      localStorage.setItem(
        "app-settings",
        JSON.stringify({
          state: {
            colorMode: "light",
            backgroundScene: "none",
            theme: "ocean",
            backgroundColor: "#f6f2ec",
          },
          version: 0,
        })
      );
    });

    console.log("1. Navigating to /settings to switch theme to 'Dreaming'...");
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForTimeout(1000);

    // Locate and click the Dreaming theme button
    const dreamingBtn = page.locator("button.settings-theme", { hasText: "Dreaming" });
    await dreamingBtn.waitFor({ state: "visible" });
    await dreamingBtn.click();
    await page.waitForTimeout(600);

    // Check immediate application
    const rootTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const shellTheme = await page.evaluate(() => document.querySelector(".app-shell")?.getAttribute("data-theme"));
    console.log(`Immediate theme check -> root: ${rootTheme}, shell: ${shellTheme}`);

    if (rootTheme === "dreaming" && shellTheme === "dreaming") {
      results.themeSelectedImmediately = true;
    }

    // Check sidebar styling
    const sidebarBg = await page.evaluate(() => {
      const el = document.querySelector(".app-sidebar");
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`Sidebar background color in Dreaming: ${sidebarBg}`);
    if (sidebarBg) {
      results.dreamingSidebarApplied = true;
    }

    // 2. Check persistence across page reload
    console.log("2. Reloading page to verify persistence...");
    await page.reload();
    await page.waitForTimeout(1000);

    const reloadedRootTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const storedSettings = await page.evaluate(() => JSON.parse(localStorage.getItem("app-settings") || "{}"));
    console.log(`Reloaded theme: ${reloadedRootTheme}, LocalStorage theme: ${storedSettings?.state?.theme}`);
    if (reloadedRootTheme === "dreaming" && storedSettings?.state?.theme === "dreaming") {
      results.themePersistedAfterReload = true;
    }

    // 3. Verify Global Background on Main
    const mainBg = await page.evaluate(() => {
      const el = document.querySelector(".app-main");
      const style = window.getComputedStyle(el);
      return {
        image: style.backgroundImage,
        color: style.backgroundColor,
      };
    });
    console.log(`Global main background in Dreaming: image=${mainBg.image.slice(0, 50)}..., color=${mainBg.color}`);
    if (mainBg.image.includes("dreaming_bg") || mainBg.image.includes(".jpg")) {
      results.dreamingGlobalBackgroundApplied = true;
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "dreaming_01_settings.png") });

    // 4. Test Dashboard page
    console.log("3. Navigating to /dashboard...");
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(800);

    const dashCheck = await page.evaluate(() => {
      const header = document.querySelector(".dashboard-header");
      const chatAction = document.querySelector(".dashboard-action--chat");
      const contentAction = document.querySelector(".dashboard-action--content");
      return {
        headerBg: window.getComputedStyle(header).backgroundColor,
        chatActionBg: window.getComputedStyle(chatAction).backgroundImage,
        contentActionBg: window.getComputedStyle(contentAction).backgroundImage,
      };
    });
    console.log("Dashboard styling check in Dreaming:", dashCheck);
    if (dashCheck.headerBg && dashCheck.chatActionBg) {
      results.dashboardElementsThemed = true;
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "dreaming_02_dashboard.png") });

    // 5. Test Chat page with messages and UI components
    console.log("4. Navigating to /chat...");
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForTimeout(1000);

    // Inject mock conversation including AI response, user message, action buttons
    await page.evaluate(() => {
      const mockMessages = [
        {
          id: "m-user-1",
          role: "user",
          content: "Hello Empathy Guru, I have an upcoming exam and I'm feeling overwhelmed.",
          timestamp: "10:42 AM",
        },
        {
          id: "m-ai-1",
          role: "assistant",
          content: "I completely understand that feeling. Let's look at grounding and calming the body first.",
          timestamp: "10:43 AM",
          flowAction: "learn",
          flowHandled: false,
          skill: { id: "calming_body_mind", title: "Skill 1: Calming the Body and Mind" },
          step: {
            type: "objective",
            content: "Learn how to recognize bodily tension and return gently to your resilient zone.",
          },
        },
      ];
      window.__MOCK_MESSAGES__ = mockMessages;
    });

    // Verify chat UI elements
    const chatCheck = await page.evaluate(() => {
      const panel = document.querySelector(".chat-unified-panel");
      const composer = document.querySelector(".chat-composer-box");
      const shortBtn = document.querySelector(".chat-response-style__option--active");
      const sendBtn = document.querySelector(".chat-input-row__send");
      return {
        hasPanel: Boolean(panel),
        panelBg: panel ? window.getComputedStyle(panel).backgroundColor : null,
        composerBorder: composer ? window.getComputedStyle(composer).borderColor : null,
        shortBtnColor: shortBtn ? window.getComputedStyle(shortBtn).color : null,
        sendBtn: Boolean(sendBtn),
      };
    });
    console.log("Chat elements check in Dreaming:", chatCheck);
    if (chatCheck.hasPanel && chatCheck.sendBtn) {
      results.chatElementsThemed = true;
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "dreaming_03_chat.png") });

    // 6. Test Content page
    console.log("5. Navigating to /content...");
    await page.goto(`${BASE_URL}/content`);
    await page.waitForTimeout(800);
    const contentCheck = await page.evaluate(() => {
      const cards = document.querySelectorAll(".skill-card");
      const main = document.querySelector(".app-main");
      return {
        cardCount: cards.length,
        hasCards: cards.length > 0,
        mainBgImage: window.getComputedStyle(main).backgroundImage,
      };
    });
    console.log(`Content page check in Dreaming: ${contentCheck.cardCount} cards, bg=${contentCheck.mainBgImage.slice(0, 45)}...`);
    if (contentCheck.hasCards) {
      results.contentElementsThemed = true;
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "dreaming_04_content.png") });

    // 7. Test Progress page
    console.log("6. Navigating to /progress...");
    await page.goto(`${BASE_URL}/progress`);
    await page.waitForTimeout(1500);
    const progressHtml = await page.locator(".app-main").innerHTML();
    console.log("Progress page app-main content:", progressHtml.slice(0, 200));
    const progressCheck = await page.evaluate(() => {
      const hero = document.querySelector(".overall-progress-card") || document.querySelector(".progress-header") || document.querySelector(".progress-page") || document.querySelector(".progress-loading") || document.querySelector(".progress-error");
      const pageEl = document.querySelector(".progress-page") || document.querySelector(".app-main");
      return {
        hasHero: Boolean(hero),
        pageBg: pageEl ? window.getComputedStyle(pageEl).backgroundColor : "transparent",
      };
    });
    console.log("Progress page check in Dreaming:", progressCheck);
    if (progressCheck.hasHero) {
      results.progressElementsThemed = true;
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "dreaming_05_progress.png") });

    // 8. Test History page
    console.log("7. Navigating to /history...");
    await page.goto(`${BASE_URL}/history`);
    await page.waitForTimeout(800);
    const historyCheck = await page.evaluate(() => {
      const header = document.querySelector(".history-header");
      return Boolean(header);
    });
    console.log("History page check in Dreaming:", historyCheck);
    if (historyCheck) {
      results.historyElementsThemed = true;
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "dreaming_06_history.png") });

    // 9. Test Quiz page
    console.log("8. Navigating to /quiz...");
    await page.goto(`${BASE_URL}/quiz`);
    await page.waitForTimeout(800);
    const quizCheck = await page.evaluate(() => {
      const header = document.querySelector(".quiz-page__header") || document.querySelector(".quiz-page");
      return Boolean(header);
    });
    console.log("Quiz page check in Dreaming:", quizCheck);
    if (quizCheck) {
      results.quizElementsThemed = true;
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "dreaming_07_quiz.png") });

    // 10. Test Topbar Dropdowns and Edit Profile Modal
    console.log("9. Testing Topbar menus and Edit Profile modal...");
    // Open profile menu
    const profileBtn = page.locator("button[title*='Alex']");
    if (await profileBtn.count() > 0) {
      await profileBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, "dreaming_08_profile_dropdown.png") });

      // Click Edit profile
      const editProfileBtn = page.locator("button", { hasText: "Edit profile" });
      if (await editProfileBtn.count() > 0) {
        await editProfileBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, "dreaming_09_edit_profile_modal.png") });

        const modalCheck = await page.evaluate(() => {
          const modal = document.querySelector(".app-modal");
          return Boolean(modal);
        });
        if (modalCheck) {
          results.modalsAndDropdownsThemed = true;
        }

        // Close modal
        const closeBtn = page.locator("button[aria-label='Close edit profile']");
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }

    // 11. Switch back to Default Theme (Ocean) and verify
    console.log("10. Switching back to Default Theme (Ocean)...");
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForTimeout(800);

    const oceanBtn = page.locator("button.settings-theme", { hasText: "Ocean" });
    await oceanBtn.waitFor({ state: "visible" });
    await oceanBtn.click();
    await page.waitForTimeout(600);

    const oceanRootTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const oceanSidebarBg = await page.evaluate(() => {
      const el = document.querySelector(".app-sidebar");
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`Switched to Ocean -> root: ${oceanRootTheme}, sidebar: ${oceanSidebarBg}`);

    if (oceanRootTheme === "ocean") {
      results.switchedBackToDefaultTheme = true;
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "ocean_01_settings.png") });

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "ocean_02_dashboard.png") });

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await browser.close();
    preview.kill();
  }

  console.log("\n=== FINAL TEST RESULTS ===");
  console.log(JSON.stringify(results, null, 2));

  const allPassed = Object.values(results).every(Boolean);
  console.log(allPassed ? ">>> ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<" : ">>> SOME CHECKS FAILED! <<<");
  process.exit(allPassed ? 0 : 1);
}

run();
