# Bug Report

## BUG-001: Country Selection Not Carried Over from Estimate Shipping to Checkout Billing Address

### Bug Title
Country selected in "Estimate Shipping" on the Shopping Cart page is not pre-populated in the Billing Address form on the Checkout page.

### Description
When a user selects a country in the "Estimate Shipping" section of the Shopping Cart page and then proceeds to Checkout, the selected country is not transferred to the Billing Address form. The Country field on the Checkout page resets to the default "Select country" placeholder, requiring the user to re-enter information they have already provided. This creates a disjointed user experience and may lead to confusion or user drop-off during checkout.

### Steps to Reproduce
1. Open https://demowebshop.tricentis.com in Google Chrome on a desktop.
2. Add any product to the shopping cart (e.g. "Computing and Internet" book).
3. Navigate to the Shopping Cart page.
4. In the **"Estimate Shipping"** section, select **Country: Slovenia**, State: Other (Non US), and enter a Zip/Postal code (e.g. 1231).
5. Click the **"Estimate shipping"** button.
6. Check the "I agree with the terms of service" checkbox. 
7. Click the **"Checkout"** button.
8. Observe the **Country** field on the Billing Address form (Step 1 of Checkout).

### Expected Result
The Country field in the Billing Address form should be pre-populated with **Slovenia** (the country selected during shipping estimation), reducing redundant data entry for the user.

### Actual Result
The Country field in the Billing Address form displays the default **"Select country"** placeholder. The country selection from the Estimate Shipping section is not carried over to the Checkout page.

### Screenshots

**Shopping Cart — Country "Slovenia" selected in Estimate Shipping:**
![Shopping cart with Slovenia selected](test-evidence/bug-001/01-shopping-cart-slovenia-selected.png)

**Checkout Billing Address — Country field reset to "Select country":**
![Checkout with empty country field](test-evidence/bug-001/02-checkout-country-empty.png)

### Environment
- **Browser:** Google Chrome (Desktop)
- **URL:** https://demowebshop.tricentis.com
- **OS:** macOS
- **Test date:** 2026-07-01

### Severity & Priority
| Attribute | Assessment |
|-----------|-----------|
| **Severity** | Medium |
| **Priority** | Medium |

**Severity rationale:** The user can still complete the checkout by re-selecting the country manually. However, the loss of previously entered data creates unnecessary friction and can lead to user frustration or drop-off, particularly on mobile or for international users who have already identified their shipping destination.

**Priority rationale:** Checkout is a critical user flow directly tied to conversion. Any friction at this stage should be addressed in a timely manner, though it does not block the purchase from being completed.
