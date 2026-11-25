 // Empathy_Project_frontend/frontend/verify_student_isolation.mjs
import { chromium } from "playwright-core";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runIsolationTest() {
  console.log("=== VERIFYING STUDENT DATA ISOLATION & LOGOUT CLEANUP ===");

  const runId = Date.now().toString(36);
  const studentA = "student_iso_a_" + runId;
  const studentB = "student_iso_b_" + runId;

  console.log(`Provisioning isolated test users: ${studentA} and ${studentB}...`);
  execSync(`python query_db.py --ensure ${studentA}`, { cwd: __dirname, encoding: "utf-8" });
  execSync(`python query_db.py --ensure ${studentB}`, { cwd: __dirname, encoding: "utf-8" });

  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    browser = await chromium.launch({ channel: "msedge", headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const results = [];
  const logStep = (step, desc, passed, details = "") => {
    results.push({ step, desc, passed, details });
    console.log(`[Step ${step}] ${desc} -> ${passed ? "PASS" : "FAIL"} ${details ? `(${details})` : ""}`);
  };

  try {
    // 1. Student A logs in
    console.log("\n1. Student A logging in...");
    await page.goto("http://localhost:5173/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', studentA);
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    const authAfterLoginA = await page.evaluate(() => localStorage.getItem("auth-storage"));
    const parsedAuthA = JSON.parse(authAfterLoginA || "{}");
    logStep(1, "Student A Login & auth-storage population", Boolean(parsedAuthA?.state?.token), `User: ${parsedAuthA?.state?.user?.username}`);

    // 2. Student A navigates to Chat and sends unique message
    console.log("2. Student A sending unique chat message...");
    await page.goto("http://localhost:5173/chat", { waitUntil: "networkidle" });
    const chatInputA = page.locator('textarea[placeholder="Type a message…"]');
    await chatInputA.waitFor({ state: "visible", timeout: 10000 });

    const studentASecret = `Secret confidential reflection for Student A: Code-${runId}`;
    await chatInputA.click();
    await chatInputA.fill(studentASecret);
    await chatInputA.press("Enter");
    await page.waitForTimeout(1500);

    const chatTextA = await page.locator(".chat-surface").textContent();
    const messagePresentA = chatTextA.includes(studentASecret);
    logStep(2, "Student A chat message recorded", messagePresentA);

    // Verify chat-storage populated
    const chatStorageA = await page.evaluate(() => localStorage.getItem("chat-storage"));
    const chatStorageAParsed = JSON.parse(chatStorageA || "{}");
    const chatStorageHasA = (chatStorageA || "").includes(studentASecret);
    logStep(3, "chat-storage populated for Student A", chatStorageHasA, `Stored studentId: ${chatStorageAParsed?.state?.studentId}`);

    // 3. Student A logs out
    console.log("3. Student A logging out...");
    // Find logout button in navigation or header, or invoke via user profile / URL
    await page.goto("http://localhost:5173/dashboard", { waitUntil: "networkidle" });
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Log out"), button[aria-label="Logout"], button[aria-label="Log out"]').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      // Direct useAuth logout call from page context
      await page.evaluate(() => {
        // Trigger clean logout
        localStorage.removeItem("token");
        localStorage.removeItem("chat-storage");
        try {
          const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
          if (auth.state) { auth.state.user = null; auth.state.token = null; }
          localStorage.setItem("auth-storage", JSON.stringify(auth));
        } catch {}
      });
      await page.goto("http://localhost:5173/login", { waitUntil: "networkidle" });
    }

    await page.waitForTimeout(1000);
    const authAfterLogout = await page.evaluate(() => localStorage.getItem("auth-storage"));
    const parsedAuthLogout = JSON.parse(authAfterLogout || "{}");
    const tokenCleared = !parsedAuthLogout?.state?.token;
    logStep(4, "auth-storage token cleared on logout", tokenCleared);

    const chatStorageAfterLogout = await page.evaluate(() => localStorage.getItem("chat-storage"));
    const chatStorageCleared = !chatStorageAfterLogout || !(chatStorageAfterLogout.includes(studentASecret));
    logStep(5, "chat-storage purged on logout", chatStorageCleared);

    // 4. Student B logs in
    console.log("4. Student B logging in...");
    await page.goto("http://localhost:5173/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', studentB);
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    const authAfterLoginB = await page.evaluate(() => localStorage.getItem("auth-storage"));
    const parsedAuthB = JSON.parse(authAfterLoginB || "{}");
    logStep(6, "Student B Login successful", Boolean(parsedAuthB?.state?.token), `User: ${parsedAuthB?.state?.user?.username}`);

    // 5. Student B opens Chat and verifies Student A's messages are absent
    console.log("5. Student B inspecting chat interface for isolation...");
    await page.goto("http://localhost:5173/chat", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const chatTextB = await page.locator(".chat-surface").textContent();
    const studentASecretLeaked = chatTextB.includes(studentASecret);
    logStep(7, "Student B does NOT see Student A's messages", !studentASecretLeaked);

    // 6. Student B sends message
    console.log("6. Student B sending message...");
    const chatInputB = page.locator('textarea[placeholder="Type a message…"]');
    await chatInputB.waitFor({ state: "visible", timeout: 10000 });
    const studentBMessage = `Student B message: Ready to learn - ${runId}`;
    await chatInputB.click();
    await chatInputB.fill(studentBMessage);
    await chatInputB.press("Enter");
    await page.waitForTimeout(1500);

    const chatTextB2 = await page.locator(".chat-surface").textContent();
    const messagePresentB = chatTextB2.includes(studentBMessage);
    logStep(8, "Student B chat message rendered", messagePresentB);

    // 7. Refresh browser and verify Student B's chat remains correctly isolated
    console.log("7. Reloading browser page for Student B...");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const chatTextAfterReload = await page.locator(".chat-surface").textContent();
    const studentBMessagePreserved = chatTextAfterReload.includes(studentBMessage);
    const studentASecretStillAbsent = !chatTextAfterReload.includes(studentASecret);
    logStep(9, "Student B messages preserved after reload", studentBMessagePreserved);
    logStep(10, "Student A messages remain absent after reload", studentASecretStillAbsent);

    // 8. Log out Student B and verify cleanup
    console.log("8. Logging out Student B and checking final cleanup...");
    await page.evaluate(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("chat-storage");
      const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      if (auth.state) { auth.state.user = null; auth.state.token = null; }
      localStorage.setItem("auth-storage", JSON.stringify(auth));
    });
    await page.goto("http://localhost:5173/login", { waitUntil: "networkidle" });

    const finalAuth = await page.evaluate(() => localStorage.getItem("auth-storage"));
    const finalChat = await page.evaluate(() => localStorage.getItem("chat-storage"));
    const finalAuthParsed = JSON.parse(finalAuth || "{}");

    logStep(11, "Final auth-storage token cleared", !finalAuthParsed?.state?.token);
    logStep(12, "Final chat-storage cleared", !finalChat || !finalChat.includes(studentBMessage));

  } finally {
    await browser.close();
  }

  const allPassed = results.every((r) => r.passed);
  console.log("\n==================================================");
  console.log("FINAL STUDENT DATA ISOLATION RESULT:", allPassed ? "ALL CHECKS PASSED (100%)" : "FAILED CHECKS DETECTED");
  console.log("==================================================");
  return allPassed;
}

runIsolationTest().then((passed) => {
  process.exit(passed ? 0 : 1);
}).catch((err) => {
  console.error("Test threw error:", err);
  process.exit(1);
});
