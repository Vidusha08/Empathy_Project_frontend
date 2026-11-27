import { chromium } from "playwright-core";
import { spawn } from "child_process";
import assert from "node:assert/strict";

async function runVerification() {
  console.log("Starting preview server on port 5176...");
  const server = spawn("npx", ["vite", "preview", "--port", "5176"], {
    shell: true,
    stdio: "pipe",
  });

  server.stdout.on("data", (d) => console.log("[server]", d.toString().trim()));
  server.stderr.on("data", (d) => console.error("[server err]", d.toString().trim()));

  await new Promise((r) => setTimeout(r, 2000));

  console.log("Launching Chromium browser...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Track console errors
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // Seed student authentication and settings
  await page.goto("http://localhost:5176/");
  await page.evaluate(() => {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          user: { role: "student", student_id: "STU-001", username: "Alex Student", name: "Alex Student" },
          token: "mock-jwt-token",
        },
        version: 0,
      })
    );
    localStorage.setItem(
      "app-settings",
      JSON.stringify({
        state: {
          colorMode: "light",
          backgroundScene: "beach",
          theme: "ocean",
          backgroundColor: "#f6f2ec",
        },
        version: 0,
      })
    );
  });

  console.log("Navigating to /chat...");
  await page.goto("http://localhost:5176/chat");
  await page.waitForTimeout(1000);

  // 1. Verify Unified Chat Panel and Glassmorphism styling
  const unifiedPanel = page.locator(".chat-unified-panel");
  assert.equal(await unifiedPanel.isVisible(), true, "Unified chat panel should be visible");

  // Verify Glassmorphism on panel
  const panelStyles = await unifiedPanel.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const bf = cs.getPropertyValue("backdrop-filter");
    const wbf = cs.getPropertyValue("-webkit-backdrop-filter");
    const filter = (bf && bf !== "none") ? bf : (wbf || cs.backdropFilter || cs.WebkitBackdropFilter || "none");
    return {
      bg: cs.backgroundColor,
      backdropFilter: filter,
      border: cs.border,
    };
  });
  console.log("Panel styles:", panelStyles);
  assert.match(panelStyles.bg, /rgba\(255,\s*255,\s*255,\s*0\.72\)/, "Panel should have rgba(255, 255, 255, 0.72) background");
  assert.match(panelStyles.backdropFilter, /blur\(12px\)/, "Panel should have backdrop-filter blur(12px)");

  // Verify Background Image on app-main
  const appMainStyles = await page.locator(".app-main").evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      bgImage: cs.backgroundImage,
      bgSize: cs.backgroundSize,
      bgPosition: cs.backgroundPosition,
    };
  });
  console.log("App Main styles:", appMainStyles);
  assert.ok(appMainStyles.bgImage.includes("beach_bg"), "App main should display beach background image");
  assert.equal(appMainStyles.bgSize, "cover", "Background size should be cover");
  assert.ok(appMainStyles.bgPosition.includes("50%") || appMainStyles.bgPosition.includes("center"), "Background position should be center");

  // Verify messages area is transparent so background shows through
  const messagesAreaBg = await page.locator(".chat-messages-area").evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });
  console.log("Messages Area Background:", messagesAreaBg);
  assert.equal(messagesAreaBg, "rgba(0, 0, 0, 0)", "Messages area should be transparent for background visibility");

  // 2. Verify Chat Header inside Panel
  const headerTitle = page.locator(".chat-panel__header h1");
  assert.equal(await headerTitle.isVisible(), true, "Header title should be visible");
  assert.equal(await headerTitle.textContent(), "Chat With EmpathyGuru");

  const onlineBadge = page.locator(".chat-panel__header").getByText("Online Companion");
  assert.equal(await onlineBadge.isVisible(), true, "Online Companion badge should be visible");

  // Screenshot 1: Desktop Expanded
  await page.screenshot({ path: "test-artifacts/01_desktop_expanded.png" });
  console.log("Captured test-artifacts/01_desktop_expanded.png");

  // 3. Test Header Show/Hide Toggle
  const toggleBtn = page.locator('button[aria-label="Collapse chat header"], button[aria-label="Expand chat header"]');
  assert.equal(await toggleBtn.isVisible(), true, "Header collapse toggle button should be visible");

  // Collapse header
  await toggleBtn.click();
  await page.waitForTimeout(400);
  const expandBtn = page.locator('button[aria-label="Expand chat header"]');
  assert.equal(await expandBtn.isVisible(), true, "Header expand toggle should now be visible");

  // Screenshot 2: Desktop Collapsed
  await page.screenshot({ path: "test-artifacts/02_desktop_collapsed.png" });
  console.log("Captured test-artifacts/02_desktop_collapsed.png");

  // Expand header back
  await expandBtn.click();
  await page.waitForTimeout(400);
  assert.equal(await headerTitle.isVisible(), true, "Header title should be visible after expanding");

  // 4. Verify Transparent Message Composer & Width matching message layout
  const composerContainer = page.locator(".chat-composer-container");
  const composerContainerBg = await composerContainer.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log("Composer Container Background:", composerContainerBg);
  assert.equal(composerContainerBg, "rgba(0, 0, 0, 0)", "Composer container must have fully transparent background");

  const composerBox = page.locator(".chat-composer-box");
  const composerBoxBg = await composerBox.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log("Composer Box Background:", composerBoxBg);
  assert.equal(composerBoxBg, "rgba(0, 0, 0, 0)", "Composer box must have fully transparent background");

  // Verify Composer width matches available message area width
  const messagesBox = await page.locator(".chat-messages-area").boundingBox();
  const composerBoxBounds = await composerBox.boundingBox();
  console.log("Message area bounds:", messagesBox, "Composer box bounds:", composerBoxBounds);
  // Composer box is inside px-3 / sm:px-4 (16px on desktop)
  assert.ok(Math.abs(composerBoxBounds.x - (messagesBox.x + 16)) < 2, "Composer box left edge should align with messages padding");
  assert.ok(Math.abs((composerBoxBounds.x + composerBoxBounds.width) - (messagesBox.x + messagesBox.width - 16)) < 2, "Composer box right edge should align with messages padding");

  // Verify Composer compact height (should be slim, <= 85px when empty)
  console.log("Composer box height:", composerBoxBounds.height);
  assert.ok(composerBoxBounds.height <= 85, `Composer box height should be compact (<= 85px), got ${composerBoxBounds.height}px`);

  const textarea = page.locator('textarea[placeholder="Chat with EmpathyGuru..."]');
  assert.equal(await textarea.isVisible(), true, "Textarea with placeholder should be visible");
  const responseOptionsInside = composerBox.locator(".chat-response-style__options");
  assert.equal(await responseOptionsInside.isVisible(), true, "Short/Long options should be inside the composer box");

  const shortBtn = composerBox.locator('button:has-text("Short")');
  const longBtn = composerBox.locator('button:has-text("Long")');
  assert.equal(await shortBtn.isVisible(), true, "Short button should be visible inside composer");
  assert.equal(await longBtn.isVisible(), true, "Long button should be visible inside composer");

  // Verify icons inside Short and Long buttons
  const shortIcon = shortBtn.locator('svg');
  const longIcon = longBtn.locator('svg');
  assert.equal(await shortIcon.isVisible(), true, "Short button should have an icon");
  assert.equal(await longIcon.isVisible(), true, "Long button should have an icon");

  // Tooltips
  assert.equal(await shortBtn.getAttribute("title"), "Short responses: concise and direct");
  assert.equal(await longBtn.getAttribute("title"), "Long responses: detailed and comprehensive");

  // Verify action icons: attachment, microphone, and send
  const attachBtn = composerBox.locator('.chat-input-row__attach');
  const micBtn = composerBox.locator('.chat-input-row__mic');
  const sendBtn = composerBox.locator('.chat-input-row__send');
  assert.equal(await attachBtn.isVisible(), true, "Attachment button should be visible");
  assert.equal(await micBtn.isVisible(), true, "Microphone button should be visible");
  assert.equal(await sendBtn.isVisible(), true, "Send button should be visible");

  // Toggle Short/Long
  await longBtn.click();
  await page.waitForTimeout(200);
  assert.equal(await longBtn.getAttribute("aria-pressed"), "true", "Long button should be pressed");

  await shortBtn.click();
  await page.waitForTimeout(200);
  assert.equal(await shortBtn.getAttribute("aria-pressed"), "true", "Short button should be pressed");

  // 6. Test Multiline Input
  await textarea.fill("Line 1");
  await textarea.press("Shift+Enter");
  await textarea.type("Line 2");
  const textValue = await textarea.inputValue();
  assert.equal(textValue, "Line 1\nLine 2", "Textarea supports multiline Shift+Enter");

  // 7. Inject conversation history with messages, activities, and quiz
  await page.evaluate(() => {
    const mockMessages = [
      {
        id: "msg-welcome",
        role: "assistant",
        content: "Hi there 👋 I'm your Empathy Guide. How are you feeling today?",
        timestamp: "02:13 PM",
      },
      {
        id: "msg-user-1",
        role: "user",
        content: "Hello EmpathyGuru!",
        timestamp: "02:13 PM",
      },
      {
        id: "msg-step-1",
        role: "assistant",
        content: "I'm here to listen and guide you through calming exercises and helpful skills.",
        timestamp: "02:13 PM",
      },
      {
        id: "msg-step-2",
        role: "assistant",
        content: "Here is an explanation of the resilient zone using an A/L exam example.",
        flowAction: "learn",
        flowHandled: false,
        skill: { id: "skill_01", title: "Skill 1: Calming the Body and Mind" },
        step: {
          type: "direct_answer",
          content: "Here is an explanation of the resilient zone using an A/L exam example.",
        },
        timestamp: "02:14 PM",
      },
      {
        id: "msg-step-3",
        role: "assistant",
        content: "Let's explore the activity for this objective.",
        flowAction: "activity",
        flowHandled: false,
        skill: { id: "skill_01", title: "Skill 1: Calming the Body and Mind" },
        recommendedActivity: {
          id: "activity_01_02",
          title: "What Would You Do?",
          progress_item_id: "activity_01_02",
          progress_item_type: "activity",
          interaction_type: "practical",
        },
        step: {
          step: 3,
          type: "activity",
          content: "Read the situation and choose the response that shows the most empathy.",
          activity: {
            id: "activity_01_02",
            title: "What Would You Do?",
            type: "activity",
            interaction_type: "practical",
            instructions: "Read the situation and choose the response that shows the most empathy.",
            scenario: "Your friend is sitting alone and looks upset. When you ask if everything is okay, they say, 'I don't want to talk about it.'",
            options: [
              { id: "A", text: "You should tell me what's wrong." },
              { id: "B", text: "Okay. If you ever feel like talking, I'm here for you." },
              { id: "C", text: "You shouldn't be upset about it." },
            ],
            best_answer: "B",
            feedback: {
              correct: "Good choice! You respected your friend's feelings and gave them space while showing that you are available to support them.",
              A: "Not quite. Asking someone to explain themselves can make them feel pressured.",
              C: "Not quite. Telling someone how they should feel can dismiss their emotions.",
            },
          },
        },
        timestamp: "02:14 PM",
      },
      {
        id: "msg-step-4",
        role: "assistant",
        content: "Quick practice check:",
        flowAction: "practice",
        flowHandled: false,
        skill: { id: "skill_01", title: "Skill 1: Calming the Body and Mind" },
        step: {
          step: 4,
          type: "practice_check",
          question: "True or false: Being in the resilient zone means you can handle life's ups and downs.",
          question_type: "true_false",
          correct_answer: true,
        },
        timestamp: "02:14 PM",
      },
    ];

    localStorage.setItem(
      "chat-storage",
      JSON.stringify({
        state: {
          messages: mockMessages,
          answerStyle: "short",
        },
        version: 0,
      })
    );
  });

  await page.reload();
  await page.waitForTimeout(1000);

  // 8. Verify End Conversation button is removed from header
  const endConvBtn = page.locator('[data-testid="end-conversation-button"]');
  assert.equal(await endConvBtn.count(), 0, "End Conversation button should be removed from header");

  // Verify User Message Bubble styling (Purple Gradient)
  const userBubble = page.locator(".chat-bubble-user").first();
  assert.equal(await userBubble.isVisible(), true, "User message bubble should be visible");
  const userBubbleStyle = await userBubble.evaluate((el) => window.getComputedStyle(el).backgroundImage);
  console.log("User bubble backgroundImage:", userBubbleStyle);
  assert.ok(userBubbleStyle.includes("linear-gradient"), "User bubble must have a purple linear gradient");

  // Verify AI Message Bubble styling (Soft white translucent glass)
  const aiBubble = page.locator(".chat-bubble-ai").first();
  assert.equal(await aiBubble.isVisible(), true, "AI message bubble should be visible");
  const aiBubbleStyle = await aiBubble.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    const bf = cs.getPropertyValue("backdrop-filter");
    const wbf = cs.getPropertyValue("-webkit-backdrop-filter");
    const filter = (bf && bf !== "none") ? bf : (wbf || cs.backdropFilter || cs.WebkitBackdropFilter || "none");
    return {
      bg: cs.backgroundColor,
      backdropFilter: filter,
    };
  });
  console.log("AI bubble style:", aiBubbleStyle);
  assert.match(aiBubbleStyle.bg, /rgba\(255,\s*255,\s*255,\s*0\.88\)/, "AI bubble should have soft white translucent background");
  assert.match(aiBubbleStyle.backdropFilter, /blur\(1[02]px\)/, "AI bubble should have backdrop blur");

  // Scroll to user bubble and capture screenshot showing user purple gradient bubble & assistant bubble
  await userBubble.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "test-artifacts/06_user_message_bubble.png" });
  console.log("Captured test-artifacts/06_user_message_bubble.png");

  // Click activity option B
  const activityOptionB = page.locator('button:has-text("Okay. If you ever feel like talking, I\'m here for you.")');
  if (await activityOptionB.isVisible()) {
    await activityOptionB.click();
    await page.waitForTimeout(300);
  }

  // Screenshot 3: Desktop With Messages & Activities
  await page.screenshot({ path: "test-artifacts/03_with_messages.png" });
  console.log("Captured test-artifacts/03_with_messages.png");

  await page.screenshot({ path: "test-artifacts/live_chat_full_verification.png" });
  console.log("Captured test-artifacts/live_chat_full_verification.png");

  // 9. Responsive Test - Mobile Viewport (375 x 812)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "test-artifacts/04_mobile_view.png" });
  console.log("Captured test-artifacts/04_mobile_view.png");

  // 10. Responsive Test - Tablet Viewport (768 x 1024)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "test-artifacts/05_tablet_view.png" });
  console.log("Captured test-artifacts/05_tablet_view.png");

  console.log("\n=== Console Errors ===");
  console.log(consoleErrors.length === 0 ? "No console errors detected! Clean run." : consoleErrors);

  await browser.close();
  server.kill();
  console.log("\n✓ ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  process.exit(0);
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
