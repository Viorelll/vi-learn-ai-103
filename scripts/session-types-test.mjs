import { chromium, expect } from "@playwright/test";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://127.0.0.1:5173/setup");
  expect(
    await page
      .locator("html")
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--green").trim(),
      ),
  ).toBe("#62458a");
  await page
    .getByRole("button", { name: /Unique questions.*standalone/ })
    .click();
  await expect(page.locator(".picker-row")).toHaveCount(134);
  await expect(page.locator(".builder-footer")).toContainText("10 questions");
  await expect(page.locator(".range-grid button").last()).toHaveText("131–134");
  await page.locator(".size-buttons button").filter({ hasText: "15" }).click();
  await expect(page.locator(".builder-footer")).toContainText("15 questions");
  await page.locator(".range-grid button").nth(1).click();
  const pickedIds = await page
    .locator(".picker-row input:checked")
    .evaluateAll((inputs) =>
      inputs.map((input) => input.getAttribute("aria-label")),
    );
  expect(pickedIds).toEqual([
    "Select Question 18",
    "Select Question 19",
    "Select Question 20",
    "Select Question 21",
    "Select Question 22",
    "Select Question 29",
    "Select Question 30",
    "Select Question 31",
    "Select Question 32",
    "Select Question 33",
    "Select Question 34",
    "Select Question 35",
    "Select Question 36",
    "Select Question 37",
    "Select Question 39",
  ]);
  await page.reload();
  await expect(page.locator(".range-grid button.selected")).toHaveText("16–30");
  await page.locator(".range-grid button").last().click();
  await expect(page.locator(".builder-footer")).toContainText("14 questions");
  await page.locator(".size-buttons button").filter({ hasText: "30" }).click();
  await expect(page.locator(".builder-footer")).toContainText("30 questions");
  await page
    .getByRole("button", { name: "Clear selection", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Start session", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("combobox", { name: "Filter session question format" })
    .selectOption("matrix");
  await expect(page.locator(".picker-row")).toHaveCount(7);
  await page
    .getByRole("button", { name: "Select visible", exact: true })
    .click();
  await expect(page.locator(".builder-footer")).toContainText("7 questions");
  await page
    .getByRole("button", { name: "Clear selection", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Filter session question format" })
    .selectOption("multiple");
  await expect(page.locator(".picker-row")).toHaveCount(7);
  await page
    .getByRole("combobox", { name: "Filter session question format" })
    .selectOption("all");
  await page
    .getByRole("checkbox", { name: "Select Question 4", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Select Question 33", exact: true })
    .check();
  await page
    .getByRole("textbox", { name: "Search session questions" })
    .fill("33");
  await expect(
    page.getByRole("checkbox", { name: "Select Question 33", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".builder-footer")).toContainText("2 questions");
  await page.reload();
  await expect(page.locator(".builder-footer")).toContainText("2 questions");
  await page
    .getByRole("button", { name: "Start session", exact: true })
    .click();
  await expect(page).toHaveURL(/\/test\?question=4$/);
  await expect(page.locator(".test-heading h1")).toHaveText("Unique questions");
  await expect(page.locator(".question-map button")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Next question", exact: true })
    .click();
  await expect(page).toHaveURL(/\/test\?question=33$/);
  await page.reload();
  await expect(page.locator(".question-tags")).toContainText("Source #33");
  await page
    .getByRole("button", { name: "Finish session", exact: true })
    .click();
  await page.getByRole("button", { name: "Submit & see results" }).click();
  await page.getByRole("button", { name: "New session", exact: true }).click();
  await page.getByRole("button", { name: /Case studies.*One study/ }).click();
  await expect(page.locator(".picker-row")).toHaveCount(1);
  await expect(page.locator(".picker-row")).toContainText("Contoso");
  await expect(page.locator(".builder-footer")).toContainText("10 questions");
  await page
    .getByRole("button", { name: "Start session", exact: true })
    .click();
  await expect(page.locator(".test-heading h1")).toHaveText("Case studies");
  await expect(page.locator(".question-map button")).toHaveCount(10);
  await page
    .getByRole("button", { name: "Go to question 67", exact: true })
    .click();
  await expect(page.locator(".question-tags")).toContainText("Source #67");
  await page.getByRole("button", { name: "Finish & review" }).click();
  await page.getByRole("button", { name: "Submit & see results" }).click();
  await page.getByRole("button", { name: "New session", exact: true }).click();
  await page
    .getByRole("button", { name: /Shared-question variants.*Same scenario/ })
    .click();
  await expect(page.locator(".picker-row")).toHaveCount(4);
  await expect(page.locator(".builder-footer")).toContainText("15 questions");
  await page
    .getByRole("combobox", { name: "Filter session question format" })
    .selectOption("matrix");
  await expect(page.locator(".picker-row")).toHaveCount(3);
  await page
    .getByRole("combobox", { name: "Filter session question format" })
    .selectOption("all");
  await page
    .getByRole("button", { name: "Clear selection", exact: true })
    .click();
  await page
    .locator(".picker-row")
    .filter({ hasText: "Questions 23, 24, 25, 26" })
    .getByRole("checkbox")
    .check();
  await page.getByLabel("Shuffle question order").check();
  await page
    .getByRole("button", { name: "Start session", exact: true })
    .click();
  await expect(page.locator(".test-heading h1")).toHaveText(
    "Shared-question variants",
  );
  await expect(page.locator(".question-map button")).toHaveCount(4);
  for (const id of [23, 24, 25, 26]) {
    await page
      .getByRole("button", { name: `Go to question ${id}`, exact: true })
      .click();
    await expect(page.locator(".options input[type=radio]")).toHaveCount(2);
  }
  // Preserve the latest independent library route and collapsed source exhibits.
  await page.goto("http://127.0.0.1:5173/question/14");
  await expect(
    page.getByRole("heading", { name: "Question 14", exact: true }),
  ).toBeVisible();
  const exhibit = page
    .locator("details.exhibit")
    .filter({ hasText: "Original question" })
    .first();
  await expect(exhibit).not.toHaveAttribute("open", "");
  await exhibit.locator("summary").click();
  await expect(exhibit.locator("img").first()).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Question 14", exact: true }),
  ).toBeVisible();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  mobile.on("pageerror", (e) => errors.push(e.message));
  await mobile.goto("http://127.0.0.1:5173/setup");
  await mobile
    .getByRole("button", { name: /Shared-question variants.*Same scenario/ })
    .click();
  await expect(mobile.locator(".picker-row")).toHaveCount(4);
  expect(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await mobile
    .getByRole("button", { name: "Clear selection", exact: true })
    .click();
  await mobile.locator(".picker-row").first().getByRole("checkbox").check();
  await expect(mobile.locator(".builder-footer")).toContainText("4 questions");
  expect(errors).toEqual([]);
  console.log(
    "PASS: new session types, filters, saved picks, complete groups, session routes, library routes, collapsed exhibits, current purple theme, mobile layout, no React errors.",
  );
} finally {
  await browser.close();
}
