# Master Data Completion Report

## Summary

Master Data Completion was implemented as a data-first sprint. No backend validation was bypassed and availability remains calculated from real recipe and inventory data.

## Final Metrics

| Metric | Result |
| --- | ---: |
| Total Product | 14 |
| Total Variant | 23 |
| Total Active Variant | 23 |
| Total Recipe | 23 |
| Total Ingredient | 57 |
| Total Goods Receipt | 1 |
| Recipe Coverage | 23 / 23 = 100% |
| Availability Coverage, store 1 | 23 / 23 = 100% |
| Inventory Coverage | 57 / 57 ingredients have stock movement |
| Active Variant missing Recipe | 0 |
| Empty active Recipe | 0 |
| Active Variant unavailable because of missing/empty recipe/stock | 0 |

## Seed Data Added

Migration `V32__complete_pos_master_data_recipes_inventory.sql` adds:

- Migration-safe default admin actor if no user exists yet.
- Migration-safe default store if no store exists yet.
- Operational ingredients:
  - `ING000054` Baguette
  - `ING000055` Pate
  - `ING000056` Cream Cheese
  - `ING000057` Blueberry Sauce
- Active recipes for active variants missing recipes.
- Recipe ingredients for:
  - Coffee variants
  - Latte variants
  - Tea variants
  - Freeze variants
  - Food/package products
  - Combo products
  - Packaging ingredients such as cups, lids, straws, and paper bags
- Opening stock movement for every ingredient that has never had stock movement.

## Files Changed

Backend:

- `code/backend/src/main/resources/db/migration/V32__complete_pos_master_data_recipes_inventory.sql`
- `code/backend/src/test/java/com/lowlands/coffee/MasterDataCompletionTest.java`

Frontend:

- `code/frontend/src/app/[locale]/(dashboard)/admin/recipes/page.tsx`
- `code/frontend/src/app/[locale]/(dashboard)/staff/pos/page.tsx`

Docs:

- `docs/reports/master-data-gap-report.md`
- `docs/reports/master-data-completion-report.md`

## Migration Added

```text
V32__complete_pos_master_data_recipes_inventory.sql
```

The migration is idempotent for existing live data:

- Recipes are inserted only when a variant has no recipe.
- Recipe ingredients are inserted only when the recipe does not already have that ingredient.
- Ingredients are inserted only by missing ingredient code.
- Opening stock is inserted only for ingredients that do not have any stock movement.

## Frontend Updates

Admin Recipe:

- Shows Recipe Coverage as `covered active variants / total active variants`.
- Still shows variants missing active recipe if coverage is incomplete.

POS:

- Reloads product availability on page load.
- Reloads availability after POS checkout success.
- Reloads availability after an order is completed, so stock-dependent disable states can update after stock OUT.

## Test Result

Passed:

- `mvn -q clean install`
- `npm.cmd run type-check`

The backend test suite now includes `MasterDataCompletionTest`, validating:

- 100% active variant recipe coverage.
- No active variant has more than one active recipe.
- No active recipe is empty.
- No active recipe uses inactive ingredients.
- 100% ingredient stock movement coverage.
- Store 1 has no unavailable active variants due to missing recipe, empty recipe, inactive ingredient, unit mismatch, or insufficient stock.

## Remaining Issues

- Combo recipes duplicate component consumption in a single combo recipe because order completion currently does not expand `combo_items`.
- Recipe quantities are business-plausible seed values, not exact Highlands/Lowlands production formulas.
- Existing production databases with manually-created recipes are preserved by `NOT EXISTS`; coverage depends on those existing recipes not being empty or invalid.

## Next Step

If combo fulfillment needs more accuracy, update order completion to expand `combo_items` into component variants and deduct stock through component recipes instead of combo-level recipes.
