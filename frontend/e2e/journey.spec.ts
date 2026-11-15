import { test, expect, type Page } from "@playwright/test";

const user = { email: `e2e${Date.now()}@test.local`, username: `e2e_${Date.now()}`, password: "Passw0rdOK" };
const timeNow = async (page: Page) => {
  const t = (await page.getByRole("region", { name: "Player" }).locator("span.w-9").first().textContent()) || "0:00";
  const [m, s] = t.split(":").map(Number); return m * 60 + s;
};

test.describe.serial("SoundBox critical journey", () => {
  let page: Page;
  const errors: string[] = [];
  test.beforeAll(async ({ browser }) => {
    page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  });
  test.afterAll(() => expect(errors, "no runtime errors in the browser console").toEqual([]));

  test("1. opens, shows catalog and the guest is bounced from protected routes", async () => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /personal music universe/i })).toBeVisible();
    await expect(page.getByText("From the catalog")).toBeVisible();
    await page.goto("/library");
    await expect(page).toHaveURL(/\/login/);
  });

  test("2. registers", async () => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(user.email); await page.getByLabel("Username").fill(user.username); await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("heading", { name: new RegExp(user.username) })).toBeVisible();
  });

  test("3. search finds a track and plays it; position advances", async () => {
    await page.getByRole("link", { name: "Search" }).first().click();
    await page.getByRole("searchbox").fill("slow tide");
    await expect(page.getByRole("button", { name: "Play Slow Tide" })).toBeVisible();
    await page.getByRole("button", { name: "Play Slow Tide" }).click();
    const bar = page.getByRole("region", { name: "Player" });
    await expect(bar.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
    await expect.poll(() => timeNow(page), { timeout: 15000 }).toBeGreaterThanOrEqual(2); // audio is really progressing
  });

  test("4. pause, resume, seek", async () => {
    const bar = page.getByRole("region", { name: "Player" });
    await bar.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(bar.getByRole("button", { name: "Play", exact: true })).toBeVisible();
    const frozen = await timeNow(page); await page.waitForTimeout(1500); expect(await timeNow(page)).toBe(frozen);
    await bar.getByRole("slider", { name: "Seek" }).fill("25");
    await expect.poll(() => timeNow(page)).toBeGreaterThanOrEqual(25);
    await bar.getByRole("button", { name: "Play", exact: true }).click();
    await expect(bar.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  });

  test("5. queue: add, reorder, remove", async () => {
    await page.getByRole("link", { name: "Search" }).first().click();
    await page.goto("/search?genre=Electronic");
    await page.getByRole("button", { name: /More actions for Overclock/ }).click();
    await page.getByRole("menuitem", { name: "Add to queue" }).click();
    await page.getByRole("button", { name: /More actions for Glass Arcade/ }).click();
    await page.getByRole("menuitem", { name: "Play next" }).click();
    await page.getByRole("region", { name: "Player" }).getByRole("button", { name: "Queue" }).click();
    const q = page.getByRole("list", { name: "Playback queue" });
    await expect(q.getByRole("listitem")).toHaveCount(3);
    await expect(q.getByRole("listitem").nth(1)).toContainText("Glass Arcade");
    await q.getByRole("button", { name: "Move Overclock up" }).click();
    await expect(q.getByRole("listitem").nth(1)).toContainText("Overclock");
    await q.getByRole("button", { name: "Remove Overclock from queue" }).click();
    await expect(q.getByRole("listitem")).toHaveCount(2);
    await page.getByRole("button", { name: "Close queue" }).click();
  });

  test("6. favorite + playlist creation", async () => {
    await page.getByRole("button", { name: "Add to favorites" }).first().click();
    await expect(page.getByRole("button", { name: "Remove from favorites" }).first()).toBeVisible();
    await page.getByRole("button", { name: /More actions for Glass Arcade/ }).click();
    await page.getByRole("menuitem", { name: /Add to playlist/ }).click();
    await page.getByLabel("New playlist name").fill("Night Drive");
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.goto("/library?tab=playlists");
    await expect(page.getByRole("link", { name: /Night Drive/ })).toBeVisible();
    await page.goto("/library?tab=favorites");
    await expect(page.getByRole("list").getByRole("listitem").first()).toBeVisible();
  });

  test("7. music keeps playing while navigating (single engine)", async () => {
    const bar = page.getByRole("region", { name: "Player" });
    await expect(bar.getByRole("button", { name: /^(Pause|Play)$/ }).first()).toBeVisible();
    await page.getByRole("link", { name: "Home" }).first().click();
    await bar.getByRole("button", { name: "Play", exact: true }).click().catch(() => {});
    const a = await timeNow(page);
    await page.getByRole("link", { name: "Mix Maker" }).first().click();
    await page.getByRole("link", { name: "Library" }).first().click();
    await expect.poll(() => timeNow(page), { timeout: 10000 }).toBeGreaterThan(a);
  });

  test("8. keyboard shortcut toggles playback", async () => {
    const bar = page.getByRole("region", { name: "Player" });
    await page.locator("body").click({ position: { x: 700, y: 400 } });
    await page.keyboard.press("Space");
    await expect(bar.getByRole("button", { name: "Play", exact: true })).toBeVisible();
    await page.keyboard.press("Space");
    await expect(bar.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  });

  test("9. mix maker builds from the real catalog", async () => {
    await page.getByRole("link", { name: "Mix Maker" }).first().click();
    await page.getByLabel("Describe your mix").fill("calm focus music");
    await page.getByRole("button", { name: "Make mix" }).click();
    await expect(page.getByText(/from the SoundBox catalog/)).toBeVisible();
  });

  test("10. a broken audio source is reported, not silent", async () => {
    await page.route("**/media/audio/demo-corner-cafe.wav", (r) => r.fulfill({ status: 404, body: "nope" }));
    await page.goto("/search?genre=Chill");
    await page.getByRole("button", { name: "Play Corner Cafe" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /Can't play/ }).first()).toBeVisible();
  });

  test("11. logout and protected route check", async () => {
    await page.goto("/settings");
    await page.getByRole("link", { name: "Home" }).first().click();
    await page.getByRole("button", { name: "Log out" }).click();
    await page.goto("/library");
    await expect(page).toHaveURL(/\/login/);
    const me = await page.request.get("/api/auth/me"); expect(me.status()).toBe(401);
  });

  test("12. mobile layout: bottom nav + no horizontal overflow", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true });
    const m = await ctx.newPage(); await m.goto("/");
    await expect(m.getByRole("navigation", { name: "Mobile" })).toBeVisible();
    expect(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await ctx.close();
  });
});
