import { chromium } from "playwright-core";
import { spawn } from "child_process";

async function main() {
  console.log("Starting preview server...");
  const server = spawn("npx", ["vite", "preview", "--port", "5174"], {
    shell: true,
    stdio: "pipe",
  });

  server.stdout.on("data", (d) => console.log("[server]", d.toString().trim()));
  server.stderr.on("data", (d) => console.error("[server err]", d.toString().trim()));

  await new Promise((r) => setTimeout(r, 2000));

  console.log("Launching browser...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Seed auth in localStorage
  await page.goto("http://localhost:5174/");
  await page.evaluate(() => {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          user: { role: "student", student_id: "STU-001", username: "tester" },
          token: "mock-token",
        },
        version: 0,
      })
    );
  });

  console.log("Navigating to /chat...");
  await page.goto("http://localhost:5174/chat");
  await page.waitForTimeout(1000);

  // Inject messages including Yes/No, True/False, and Activity 01_02
  await page.evaluate(() => {
    const mockMessages = [
      {
        id: "msg-1",
        role: "assistant",
        content: "Here is an explanation of the resilient zone using an A/L exam example.",
        flowAction: "learn",
        flowHandled: false,
        skill: { id: "skill_01", title: "Skill 1: Calming the Body and Mind" },
        step: {
          type: "direct_answer",
          content: "Here is an explanation of the resilient zone using an A/L exam example.",
        },
      },
      {
        id: "msg-2",
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
      },
      {
        id: "msg-3",
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
  await page.waitForTimeout(1500);

  // 1. Inspect Short / Long controls
  const shortLongContainer = page.locator(".chat-response-style__options");
  const shortLongText = await shortLongContainer.textContent();
  console.log("\n=== Short / Long Control ===");
  console.log("textContent:", JSON.stringify(shortLongText));
  const shortLongBtns = await shortLongContainer.locator("button").all();
  for (let i = 0; i < shortLongBtns.length; i++) {
    const btn = shortLongBtns[i];
    const text = await btn.textContent();
    const box = await btn.boundingBox();
    const cs = await btn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { minWidth: s.minWidth, padding: s.padding, border: s.border, background: s.backgroundColor, gap: s.gap };
    });
    console.log(`  Button ${i} (${text.trim()}):`, { box, cs });
  }

  // 2. Inspect Choice Groups (Yes/No and True/False)
  const choiceGroups = await page.locator(".chat-choice-group").all();
  console.log("\n=== Choice Groups (Count: " + choiceGroups.length + ") ===");
  for (let g = 0; g < choiceGroups.length; g++) {
    const group = choiceGroups[g];
    const text = await group.textContent();
    console.log(`\nGroup ${g} textContent: ${JSON.stringify(text)}`);
    const buttons = await group.locator("button").all();
    for (let b = 0; b < buttons.length; b++) {
      const btn = buttons[b];
      const btnText = await btn.textContent();
      const box = await btn.boundingBox();
      console.log(`  Button ${b} (${btnText.trim()}):`, { x: box?.x, width: box?.width });
    }
  }

  // 3. Inspect Activity Step Scenario and Choices
  console.log("\n=== Activity 01_02 Scenario & Interactive Options ===");
  const situationEl = page.locator("text=Your friend is sitting alone and looks upset.");
  const situationVisible = await situationEl.isVisible();
  console.log("Scenario situation card visible:", situationVisible);

  const optionBtns = await page.locator('[aria-label="Activity choices"] button').all();
  console.log("Interactive activity option buttons found:", optionBtns.length);
  for (let i = 0; i < optionBtns.length; i++) {
    const text = await optionBtns[i].textContent();
    console.log(`  Activity Choice ${i}: ${text.trim()}`);
  }

  // Click Option B
  if (optionBtns.length >= 2) {
    await optionBtns[1].click();
    await page.waitForTimeout(500);
    const feedbackEl = page.locator("text=Good choice! You respected your friend's feelings");
    const feedbackVisible = await feedbackEl.isVisible();
    console.log("Formative feedback displayed on choice:", feedbackVisible);
  }

  await page.screenshot({ path: "test-artifacts/live_chat_full_verification.png" });
  console.log("\nScreenshot saved to test-artifacts/live_chat_full_verification.png");

  await browser.close();
  server.kill();
  console.log("All browser tests completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
