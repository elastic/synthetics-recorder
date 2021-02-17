const { journey, step } = require("@elastic/synthetics");

journey("test", async ({ page }) => {
  step("go to home page", async () => {
    await page.goto("https://vigneshh.in");
  });
});
