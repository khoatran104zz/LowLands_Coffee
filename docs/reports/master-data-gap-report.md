# Master Data Gap Report

## Scope

This audit covers catalog and production master data for POS sellability:

- Product
- Product Variant
- Recipe
- Recipe Ingredient
- Ingredient
- Goods Receipt
- Goods Receipt Item
- Stock Movement
- Availability rules used by the backend service

The audit was run against the current codebase after Flyway migrations `V1` through `V31` and runtime bootstrap data.

## Business Rule Baseline

A product variant is sellable on POS only when all of these are true:

1. Category is `active`.
2. Product is `active`.
3. Variant is `active`.
4. Variant has exactly one active recipe.
5. Active recipe has at least one recipe ingredient.
6. Every recipe ingredient points to an active ingredient.
7. Ingredient unit matches recipe ingredient unit.
8. Store inventory has enough stock for at least one unit.

## Audit Summary

| Metric | Current value |
| --- | ---: |
| Total Product | 14 |
| Total Variant | 23 |
| Active sellable-scope Variant | 23 |
| Active Variant with active Recipe | 1 |
| Active Variant missing active Recipe | 22 |
| Empty active Recipe | 0 |
| Total Recipe | 1 |
| Total Ingredient | 53 |
| Total Goods Receipt | 1 |
| Ingredients without any Stock Movement | 50 |
| Recipe Ingredients without Stock Movement | 4 |
| Recipe Ingredients without Goods Receipt Item | 4 |
| Variant Availability = false for store 1 | 23 |

## Active Variants Missing Recipe

| Product | Variant ID | Size |
| --- | ---: | --- |
| Phin Sua Da | 1 | S |
| Phin Sua Da | 2 | M |
| Phin Sua Da | 3 | L |
| Bac Xiu | 4 | S |
| Bac Xiu | 5 | M |
| Bac Xiu | 6 | L |
| Golden Lotus Tea | 7 | M |
| Golden Lotus Tea | 8 | L |
| Green Tea Freeze | 9 | M |
| Green Tea Freeze | 10 | L |
| Phin Sua Da (Vietnamese seed) | 11 | M |
| Phin Sua Da (Vietnamese seed) | 12 | L |
| Latte | 13 | M |
| Latte | 14 | L |
| Tra Dao | 15 | M |
| Tra Dao | 16 | L |
| Banh Mi Que Pate | 17 | S |
| Banh Pho Mai Viet Quat | 18 | M |
| Ca Phe Phin Giay Lowlands | 19 | M |
| Combo Buoi Sang | 21 | M |
| Combo Doi Ban | 22 | M |
| Combo Chieu Ngot Ngao | 23 | M |

Notes:

- `Matcha Latte` size `M` has an active recipe, so it is not in the missing-recipe list.
- It is still unavailable because its recipe ingredients do not have stock movement in the audited database.

## Root Causes

### 1. Most active variants do not have recipes

The catalog seed creates active products and active variants, but recipes are not created for most variants.

Impact:

- POS can show products.
- Availability marks them unavailable with `MISSING_RECIPE`.
- Order completion would fail if these variants reach `complete`.

### 2. Recipe coverage exists for only one variant

Only one active recipe exists after current migrations:

- `REC_MATCHA_LATTE_M`
- Product: `Matcha Latte`
- Size: `M`

Impact:

- Recipe coverage is `1 / 23 = 4.35%`.

### 3. Existing recipe ingredients lack stock movement

The `Matcha Latte` recipe has ingredients, but the migration that tried to insert stock movements depends on `admin@lowlands.coffee` already existing during Flyway migration.

Current runtime creates system users in `DataBootstrap`, after Flyway migrations. Therefore the stock movement insert in `V30` can be skipped in a fresh migration-only database.

Impact:

- `Matcha Latte` has no `MISSING_RECIPE` or `EMPTY_RECIPE`.
- Availability is still false due to `INSUFFICIENT_STOCK`.

### 4. Combo products need recipe coverage too

The current order completion flow deducts inventory by looking up the recipe of the selected product variant. It does not expand `combo_items` into component product variants.

Impact:

- Active combo variants must have their own active recipes unless order completion is redesigned later.

## Required Data Completion

The next migration/data seed should:

1. Create exactly one active recipe for each active variant missing recipe.
2. Add at least one ingredient row to every active recipe.
3. Use existing ingredient catalog where possible.
4. Add missing operational ingredients only when the ingredient catalog lacks them.
5. Add opening stock or goods receipt-backed stock movement for every ingredient used in recipes.
6. Avoid duplicate recipes, duplicate recipe ingredient rows, and duplicate stock movement rows.

## Risks

- If recipes are too generic, stock consumption will be business-plausible but not exact to real store operations.
- Combo recipes duplicate component consumption in one recipe because current backend completion does not expand combo items.
- Migration cannot rely on runtime bootstrap users unless the migration also guarantees a `created_by` user exists.
- Existing live databases may already have some recipes/stock; new seed must use `NOT EXISTS` guards.

## Decision

Proceed with a new migration that completes master data without modifying old migrations and without bypassing backend validation.
