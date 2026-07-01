# Demo Web Shop — Automated Test Suite

An end-to-end UI test suite for the [Tricentis Demo Web Shop](https://demowebshop.tricentis.com),
built with **Playwright** and **TypeScript** using the **Page Object Model (POM)**.
The suite runs on **Google Chrome (desktop)** as required.

## Covered user flows

Two of the suggested flows are automated:

1. **Login** (`tests/login.spec.ts`)
   - Rejects invalid credentials and shows the "Login was unsuccessful" summary.
   - Rejects an empty email with a validation message.
   - Logs in with valid credentials and verifies the logged-in state
     *(runs only when credentials are provided — see [Credentials](#credentials)).*

2. **Product Search & Add to Cart** (`tests/search-add-to-cart.spec.ts`)
   - Searches for a term (`book`) and verifies results are returned.
   - Opens a product from the results, adds it to the cart, and verifies the
     cart contains the correct product.
   - Adds a product to the cart directly from the results listing and verifies
     the header cart counter and cart contents.
   - Verifies the cart is preserved after logging in *(credential-gated).*

## Tech stack

| Concern            | Choice                                   |
| ------------------ | ---------------------------------------- |
| Language           | TypeScript                               |
| Test framework     | Playwright Test (`@playwright/test`)     |
| Browser            | Google Chrome (desktop, `channel: chrome`) |
| Design pattern     | Page Object Model                        |
| Reporting          | Playwright HTML report                   |
| CI                 | GitHub Actions (GitLab snippet included) |

## Prerequisites

- **Node.js 18+** (the CI uses the current LTS).
- **Google Chrome** installed on the machine. The suite targets the *branded*
  Chrome channel rather than Playwright's bundled Chromium. If Chrome is not
  already installed, Playwright can install it for you (see below).

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Ensure the Google Chrome channel is available.
#    Skip this if desktop Google Chrome is already installed.
npx playwright install chrome
```

## Running the tests

```bash
npm test              # run the whole suite (headless Google Chrome)
npm run test:headed   # run with a visible browser window
npm run test:ui       # open Playwright's interactive UI mode
npm run report        # open the last HTML report
npm run typecheck     # type-check without emitting output
```

Run a single file or test:

```bash
npx playwright test tests/login.spec.ts
npx playwright test -g "adds a searched product to the cart"
```

### Credentials

The public Demo Web Shop has no shared built-in account, so the tests that need
a *real* authenticated session read credentials from environment variables and
**skip themselves** when the variables are absent. Everything else runs without
any setup.

1. Register an account at <https://demowebshop.tricentis.com/register>.
2. Copy `.env.example` to `.env` and fill it in, or export the variables in your
   shell:

```bash
export TEST_EMAIL="you@example.com"
export TEST_PASSWORD="your-password"
```

> Note: `.env` is git-ignored. Playwright does not auto-load `.env`; export the
> variables in your shell (or `source .env`) before running, or wire in a loader
> such as `dotenv` — see the commented block in `playwright.config.ts`.

`LOG_LEVEL` (`debug` | `info` | `warn` | `error`, default `info`) controls logging verbosity.

## Test reports & logs

- **HTML report** — generated automatically; open it with `npm run report`.
  On failures, screenshots and a trace (on first retry) are attached.
- **Logs** — a small dependency-free logger (`utils/logger.ts`) writes scoped,
  timestamped lines to stdout/stderr during the run to aid troubleshooting.

## Project structure

```
.
├── pages/                    # Page Object Model
│   ├── BasePage.ts           # shared header (search, login, cart) + helpers
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   ├── SearchResultsPage.ts
│   ├── ProductPage.ts
│   └── CartPage.ts
├── tests/                    # test specs
│   ├── login.spec.ts
│   └── search-add-to-cart.spec.ts
├── utils/
│   ├── logger.ts             # scoped, level-based logger
│   └── credentials.ts        # optional TEST_EMAIL / TEST_PASSWORD access
├── playwright.config.ts      # Chrome-only project, baseURL, reporter, trace
└── .github/workflows/        # CI pipeline
```

## Design approach

- **Page Object Model.** Each page of the shop is a class exposing intent-level
  actions (`searchFor`, `addToCart`, `login`) and query methods
  (`resultCount`, `containsProduct`, `isLoggedIn`). Specs read as user stories
  and contain no raw selectors, so UI changes are absorbed in one place.
- **`BasePage`.** The site header (search box, login/cart links, notification
  bar) appears on every page, so its locators and helpers live in a shared base
  class that every page object extends.
- **Fluent navigation.** Actions that move between pages return the next page
  object (e.g. `home.searchFor(...)` → `SearchResultsPage`,
  `product.goToCart()` → `CartPage`), keeping flows linear and readable.
- **Meaningful assertions.** Every step is validated — search returns results,
  the notification confirms the add, the cart contains the expected product,
  and the header counter updates.
- **Logging & error handling.** The logger records each significant action;
  Playwright's auto-waiting and web-first assertions (`expect(locator)...`)
  provide robust failure handling, with screenshots and traces on failure.
- **Resilient selectors.** Selectors prefer stable classes/ids and are scoped
  to avoid strict-mode collisions from the shop's duplicated responsive markup
  (documented inline where relevant).

## Assumptions

- Tests run against the **live** public Demo Web Shop, so they depend on that
  site being reachable and on its seeded catalogue (a search for `book`
  returning results).
- Registration is open on the site, but to keep runs idempotent the credential
  -gated tests use a **pre-existing** account supplied via environment variables
  rather than registering a new user on every run.
- The suite targets desktop Google Chrome only, per the task requirement.

## CI/CD

### GitHub Actions (included)

`.github/workflows/playwright.yml` runs on pushes and pull requests to
`main`/`master`:

1. Check out the repo and set up Node (LTS).
2. `npm ci` to install dependencies.
3. `npx playwright install --with-deps chrome` — installs the **branded Google
   Chrome** channel plus the Linux system libraries it needs (not the bundled
   Chromium), matching `channel: 'chrome'` in the config.
4. `npx playwright test` to run the suite.
5. Upload the HTML report as a build artifact (retained 30 days).

To run the credential-gated tests in CI, add `TEST_EMAIL` / `TEST_PASSWORD` as
repository secrets and expose them to the "Run" step via `env:`.

### GitLab CI/CD

Equivalent `.gitlab-ci.yml` using Playwright's official image (which already
bundles the browsers and OS dependencies):

```yaml
stages:
  - test

playwright:
  stage: test
  image: mcr.microsoft.com/playwright:v1.61.1-jammy
  variables:
    # Provide these as masked CI/CD variables to enable the login-gated tests.
    TEST_EMAIL: $TEST_EMAIL
    TEST_PASSWORD: $TEST_PASSWORD
  script:
    - npm ci
    - npx playwright install chrome        # add the branded Chrome channel
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
    expire_in: 30 days
```

The pinned Playwright Docker image keeps the browser and library versions in
lock-step with the `@playwright/test` version in `package.json`, so runs are
reproducible across local and CI environments.
