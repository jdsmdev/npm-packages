import { When, Then } from "@cucumber/cucumber";
import {
  expect,
  PlaywrightWorld,
} from "../../../packages/cucumber-playwright/lib";
import HomePage from "../pages/home";

When("I navigate to the home page", async function (this: PlaywrightWorld) {
  const homePage = this.page(HomePage);
  homePage.goto();
});

Then("I see the home page", async function (this: PlaywrightWorld) {
  const homePage = this.page(HomePage);
  expect(homePage.body).toBeVisible();
});
