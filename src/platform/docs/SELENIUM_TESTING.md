# Selenium E2E Testing — AirQo Platform

## Overview

End-to-end (E2E) testing for the AirQo Platform frontend using **Selenium WebDriver** with **TypeScript** and **Mocha**, following the official [Selenium documentation](https://www.selenium.dev/documentation/) recommendations for JavaScript projects and the [Page Object Model](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/) design pattern.

## Why JavaScript/TypeScript

The Selenium docs explicitly list JavaScript as a first-class language:

> `npm install selenium-webdriver` — [Install Library](https://www.selenium.dev/documentation/webdriver/getting_started/install_library/)
>
> Recommends **Mocha** as the test runner — [Using Selenium](https://www.selenium.dev/documentation/webdriver/getting_started/using_selenium/)

This is a Next.js 14 + TypeScript project. Using TypeScript for tests means:
- No extra runtime (Node.js already required)
- Same language, same team, same tooling
- Type safety catches errors at compile time
- Dependencies managed via `npm` alongside the rest of the project

## Tech Stack

| Component | Choice | Version |
|-----------|--------|---------|
| Browser Automation | selenium-webdriver | 4.45.0 |
| Test Runner | Mocha | 11.1.0 |
| Assertions | Chai | (via Mocha) |
| HTML Reports | Mochawesome | 7.1.3 |
| Language | TypeScript | 5.9.3 |
| Config | dotenv | 16.4.7 |
| TS Loader | ts-node | 10.9.2 |

## Directory Structure

```
platform/
├── e2e/
│   ├── package.json              # Test dependencies & scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── .env.example              # Environment template
│   ├── config.ts                 # Reads .env into Config object
│   ├── setup.ts                  # Driver creation, teardown, screenshots
│   ├── .mocharc.yml              # (optional) Mocha defaults
│   ├── reports/                  # Mochawesome HTML reports (gitignored)
│   ├── screenshots/              # Failure screenshots (gitignored)
│   ├── pages/                    # Page Object Models
│   │   ├── base.page.ts          # Shared methods: find, click, type, wait, screenshot
│   │   ├── login.page.ts
│   │   ├── register.page.ts
│   │   ├── forgot-password.page.ts
│   │   ├── reset-password.page.ts
│   │   ├── home.page.ts
│   │   ├── profile.page.ts
│   │   ├── favorites.page.ts     # Includes NotFoundPage
│   │   ├── dashboard.page.ts
│   │   ├── members.page.ts
│   │   ├── data.page.ts          # DataVisualizer, DataExport, MapPage
│   │   ├── admin.page.ts
│   │   ├── request-organization.page.ts
│   │   └── org-pages.page.ts     # OrgSettings, OrgRoles, MemberRequests
│   └── tests/
│       ├── auth/
│       │   ├── login.test.ts              # 8 tests
│       │   ├── register.test.ts           # 7 tests
│       │   ├── forgot-password.test.ts    # 4 tests
│       │   ├── reset-password.test.ts     # 4 tests
│       │   ├── protected-routes.test.ts   # 7 tests
│       │   └── form-validation.test.ts    # 5 tests
│       ├── user/
│       │   ├── home.test.ts               # 8 tests
│       │   ├── profile.test.ts            # 9 tests
│       │   ├── favorites.test.ts          # 2 tests
│       │   └── request-organization.test.ts # 4 tests
│       ├── organization/
│       │   ├── dashboard.test.ts          # 3 tests
│       │   ├── members.test.ts            # 4 tests
│       │   └── org-settings.test.ts       # 5 tests (settings, roles, member-requests)
│       ├── admin/
│       │   └── admin.test.ts              # 7 tests
│       └── data/
│           └── data.test.ts               # 7 tests
└── docs/
    └── SELENIUM_TESTING.md               # This file
```

## Setup

### Prerequisites

1. Node.js 18+
2. Chrome browser (default)
3. App running at `http://localhost:3000`

### Install & Run

```bash
cd src/platform/e2e
yarn install
cp .env.example .env    # edit with your settings
yarn test                 # run all tests
yarn test:smoke           # smoke tests only
yarn test:report          # run with HTML report
```

### From Project Root

```bash
cd src/platform
yarn test:e2e
yarn test:e2e:smoke
yarn test:e2e:report
```

## Configuration

`.env` variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | App URL |
| `BROWSER` | `chrome` | chrome / firefox / edge |
| `HEADLESS` | `true` | Headless mode |
| `IMPLICIT_WAIT` | `10` | Element wait timeout (sec) |
| `PAGE_LOAD_TIMEOUT` | `30` | Page load timeout (sec) |
| `TEST_USER_EMAIL` | — | Auth test credentials |
| `TEST_USER_PASSWORD` | — | Auth test credentials |
| `TEST_ORG_SLUG` | — | Org slug for org tests |

## Test Report

Reports generate to `e2e/reports/` as HTML files via Mochawesome:

```bash
yarn test:report     # generates reports/airqo-e2e-tests.html
```

Report includes:
- Pass/fail/skip counts with percentages
- Duration per test and suite
- Expandable error details with stack traces
- Screenshot links for failed tests
- Browser and OS metadata

## Running Tests

### By Category

```bash
yarn test:auth       # All auth tests (login, register, forgot/reset password, protected routes, validation)
yarn test:user       # User tests (home, profile, favorites, request-org)
yarn test:org        # Org tests (dashboard, members, settings, roles, member-requests)
yarn test:admin      # Admin tests (all system admin pages)
yarn test:data       # Data tests (visualizer, export, map)
yarn test:smoke      # Critical path only (@smoke tag)
yarn test:headed     # Run with browser visible (not headless)
yarn test:report     # Run all with HTML report
```

### Specific Tests

```bash
# Single file
npx mocha --require ts-node/register tests/auth/login.test.ts

# Single test by name
npx mocha --require ts-node/register --grep "should load login page" tests/auth/login.test.ts

# With longer timeout
npx mocha --require ts-node/register --timeout 60000 tests/data/data.test.ts
```

## Test Coverage

### Coverage by Module

| Module | Pages | Tests | Status |
|--------|-------|-------|--------|
| **Auth** | Login | 8 | Covered |
| | Register | 7 | Covered |
| | Forgot Password | 4 | Covered |
| | Reset Password | 4 | Covered |
| | Protected Routes | 7 | Covered |
| | Form Validation | 5 | Covered |
| **User** | Home | 8 | Covered |
| | Profile | 9 | Covered |
| | Favorites/Analytics | 2 | Covered |
| | Request Organization | 4 | Covered |
| **Organization** | Dashboard | 3 | Covered |
| | Members | 4 | Covered |
| | Settings | 2 | Covered |
| | Roles | 2 | Covered |
| | Member Requests | 2 | Covered |
| **Admin** | All System Pages | 7 | Page loads covered |
| **Data** | Visualizer | 2 | Covered |
| | Export | 2 | Covered |
| | Map | 2 | Covered |
| **Total** | | **~87** | |

### What Each Test Suite Covers

#### Auth Tests (35 tests)

**Login (`login.test.ts`)**
- Page loads with email input
- Two-step login flow (email → password)
- Successful login redirects to `/user/home`
- Password visibility toggle
- Navigation to register page
- Navigation to forgot password page
- Social auth providers displayed (Google, GitHub, LinkedIn, X)
- Invalid credentials stay on login page

**Register (`register.test.ts`)**
- Page loads with form fields
- Form has all required fields (firstName, lastName, email, password)
- Password hint text displayed
- Social auth providers displayed
- Navigation to login page
- Successful registration redirects to `/verify-email`
- Short password rejected

**Forgot Password (`forgot-password.test.ts`)**
- Page loads with email input
- Success state after valid email submission
- Empty email shows validation
- Login link navigation

**Reset Password (`reset-password.test.ts`)**
- Invalid link state for missing/fake token
- Valid token shows password form
- Mismatched passwords show error
- Password form displayed or invalid link state

**Protected Routes (`protected-routes.test.ts`)**
- Unauthenticated `/user/home` → redirect to login
- Unauthenticated `/user/profile` → redirect to login
- Unauthenticated `/user/favorites` → redirect to login
- Unauthenticated `/user/data-visualizer` → redirect to login
- Unauthenticated `/user/data-export` → redirect to login
- Unauthenticated `/user/map` → redirect to login
- Non-existent route shows 404

**Form Validation (`form-validation.test.ts`)**
- Empty email on login validation
- Invalid email format on register
- Weak password rejected (button disabled)
- Password requirements hint displayed
- Submit button disabled when form invalid

#### User Tests (23 tests)

**Home (`home.test.ts`)**
- Page loads with welcome heading
- Welcome text contains "Welcome"
- Quick access buttons displayed
- Download Data → `/user/data-export`
- My Favorites → `/favorites`
- Start Here → `/favorites`
- Video thumbnail displayed
- Request Organization → `/request-organization`

**Profile (`profile.test.ts`)**
- Page loads with profile form
- 6 tabs displayed (Profile, Security, API, Subscription, Team Invites, Theme)
- Profile form fields present
- Email field disabled
- Security tab navigation
- Password fields in security tab
- API tab accessible
- Subscription tab accessible
- Theme tab accessible

**Favorites (`favorites.test.ts`)**
- Page loads
- Charts or empty state displayed

**Request Organization (`request-organization.test.ts`)**
- Page loads with form
- Empty submission shows validation
- Short use case rejected (< 10 chars)
- Invalid email format rejected

#### Organization Tests (14 tests)

**Dashboard (`dashboard.test.ts`)**
- Loads with quick access, access denied, or no-favorites state
- Charts or no-favorites displayed
- Invalid org slug shows access denied

**Members (`members.test.ts`)**
- Page loads with title containing "MEMBERS"
- Table headers displayed
- Expected columns present (User, Status)
- Invite dialog opens

**Settings/Roles/Member Requests (`org-settings.test.ts`)**
- Settings page loads
- Theme section displayed
- Roles page loads
- Create role button present
- Member requests page loads
- Filter tabs present

#### Admin Tests (7 tests)

**System Admin (`admin.test.ts`)**
- Clients page loads
- Data table or create button on clients
- Feedback page loads
- Roles & permissions page loads
- Security page loads
- Surveys page loads
- User statistics page loads

#### Data Tests (7 tests)

**Data Visualizer (`data.test.ts`)**
- Workspace loaded
- Chart area displayed

**Data Export**
- Page loads with site selection or download button
- Download button displayed

**Map**
- Map container loaded
- Map markers displayed

## Page Object Model

Every page has a dedicated class extending `BasePage`:

```typescript
import { WebDriver, By } from "selenium-webdriver";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  private static readonly EMAIL_INPUT = By.css('input[type="email"]');
  private static readonly SUBMIT = By.css('button[type="submit"]');

  constructor(driver: WebDriver) { super(driver); }

  async navigateToLogin(): Promise<void> {
    await this.navigateTo("/user/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.typeText(LoginPage.EMAIL_INPUT, email);
    await this.click(LoginPage.SUBMIT);
    // ... password step
  }
}
```

### BasePage Methods

| Method | Description |
|--------|-------------|
| `navigateTo(path)` | Navigate to `BASE_URL + path` |
| `find(locator, timeout?)` | Find element with explicit wait |
| `findAll(locator)` | Find all matching elements |
| `click(locator, timeout?)` | Click with JS fallback |
| `typeText(locator, text, clear?)` | Clear and type |
| `getText(locator, timeout?)` | Get visible text |
| `isDisplayed(locator, timeout?)` | Check visibility |
| `waitForUrlContains(text, timeout?)` | Wait for URL change |
| `scrollTo(locator)` | Scroll into view |
| `getAttribute(locator, attr)` | Get element attribute |
| `takeScreenshot(name)` | Save screenshot to disk |
| `pressEnter()` | Press Enter key |
| `executeJs(script, ...args)` | Execute JavaScript |

### Locator Strategy

Locators follow the [Selenium recommended order](https://www.selenium.dev/documentation/webdriver/elements/locators/):

1. `By.css(...)` — preferred for form elements and buttons
2. `By.xpath(...)` — for text-based matching
3. `By.linkText(...)` — for navigation links
4. `By.css('[data-testid="..."]')` — where data-testid exists

## Writing New Tests

### Template

```typescript
import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver, screenshotOnFailure } from "../setup";
import { MyPage } from "../pages/my.page";
import { Config } from "../config";

describe("My Feature @tag", function () {
  let driver: WebDriver;
  let page: MyPage;
  this.timeout(30000);

  before(async function () {
    driver = await createDriver();
    page = new MyPage(driver);
  });

  after(async function () {
    await quitDriver();
  });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await screenshotOnFailure(this.currentTest.fullTitle());
    }
  });

  it("should do something @smoke", async function () {
    await page.navigateToMyPage();
    const result = await page.someMethod();
    expect(result).to.be.true;
  });
});
```

### Rules

1. **One describe block per page or feature** with a `@tag` in the description
2. **Fresh driver per describe block** via `before()` / `after()`
3. **Screenshot on every failure** via `afterEach()` hook
4. **Locators in page objects preferred** — tests use page object methods; raw `By` only for quick existence checks
5. **Assertions in tests only** — page objects return data, don't assert
6. **Async/await everywhere** — all Selenium calls are async
7. **Timeouts configurable** — via `.env` and `this.timeout()`

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - uses: browser-actions/setup-chrome@latest
      - name: Install e2e dependencies
        working-directory: src/platform/e2e
        run: yarn install
      - name: Run smoke tests
        working-directory: src/platform/e2e
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          TEST_ORG_SLUG: ${{ secrets.TEST_ORG_SLUG }}
        run: yarn test:smoke
      - name: Generate report
        if: always()
        working-directory: src/platform/e2e
        run: yarn test:report
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-report
          path: src/platform/e2e/reports/
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: e2e-screenshots
          path: src/platform/e2e/screenshots/
```

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('E2E Tests') {
            steps {
                sh 'cd src/platform/e2e && yarn install && yarn test:report'
            }
        }
    }
    post {
        always {
            publishHTML(target: [
                reportName: 'E2E Report',
                reportDir: 'src/platform/e2e/reports',
                reportFiles: '*.html'
            ])
            archiveArtifacts artifacts: 'src/platform/e2e/screenshots/**', allowEmptyArchive
        }
    }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `WebDriverError: Chrome not found` | Install Chrome or set `BROWSER=firefox` |
| `MODULE_NOT_FOUND` | Run `yarn install` in `e2e/` |
| `TimeoutError` | Increase `IMPLICIT_WAIT` in `.env` |
| `ElementNotInteractableError` | Add wait, scroll to element |
| Tests fail headless only | Set `HEADLESS=false` to debug |
| Flaky tests | Increase timeouts, add retries |
| `ECONNREFUSED` | Start the app first (`npm run dev`) |
| Port conflict | Check `BASE_URL` matches running app |

## References

- [Selenium JavaScript Docs](https://www.selenium.dev/documentation/webdriver/getting_started/install_library/)
- [Selenium Mocha Examples](https://www.selenium.dev/documentation/webdriver/getting_started/using_selenium/)
- [Page Object Model](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)
- [Selenium Waits](https://www.selenium.dev/documentation/webdriver/waits/)
- [Selenium Locators](https://www.selenium.dev/documentation/webdriver/elements/locators/)
