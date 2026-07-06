# Order Complete Recipe Gap Report

## Root cause

The POS complete-order failure comes from backend order completion, not from Payment V1.

The error is raised in:

- `code/backend/src/main/java/com/lowlands/coffee/modules/order/service/impl/OrderServiceImpl.java`
- method: `calculateIngredientRequirements`

Current code looks up an active recipe for each order item by product variant:

```java
recipeRepository.findByProductVariant_IdAndStatus(item.getProductVariant().getId(), ACTIVE)
```

If no active recipe exists, it throws a generic conflict message:

```text
Active recipe is missing for {productName} {size}
```

This message is technically correct but not POS-friendly and does not include structured reason/data.

## Product / variant missing recipe

Runtime audit through current API on store `1`:

- Public product count: `18`
- Variant count: `43`
- Recipe count: `1`
- Missing recipe count: `42`
- Empty recipe count: `0`
- Store stock balance rows: `3`

Only one active recipe was found:

| Product | Variant | Recipe | Ingredients |
| --- | --- | --- | --- |
| Phin Sua Da | variant `1`, size `S` | `GRN-7892`, active | Robusta Coffee Bean, `10 gram` |

Sample active variants without recipe:

| Product ID | Product | Variant ID | Size |
| --- | --- | --- | --- |
| 1 | Phin Sua Da | 2 | M |
| 1 | Phin Sua Da | 3 | L |
| 2 | Bac Xiu | 4 | S |
| 2 | Bac Xiu | 5 | M |
| 2 | Bac Xiu | 6 | L |
| 3 | Tra Sen Vang | 29 | S |
| 3 | Tra Sen Vang | 7 | M |
| 3 | Tra Sen Vang | 8 | L |
| 4 | Tra Xanh Dong Lanh | 30 | S |
| 4 | Tra Xanh Dong Lanh | 9 | M |
| 4 | Tra Xanh Dong Lanh | 10 | L |
| 6 | Latte | 13 | M |
| 6 | Latte | 14 | L |

The list above is not exhaustive; most variants currently lack active recipes.

## Backend current handling

Correct:

- Complete order reads recipe by `productVariantId`.
- Recipe is modeled as `recipes.product_variant_id`, not `product_id`.
- Complete order requires recipe ingredients.
- Complete order checks store stock before creating `StockMovement OUT`.
- Complete order is guarded against duplicate OUT movements.
- Missing recipe/empty recipe/insufficient stock blocks completion.

Needs improvement:

- Missing recipe error is too technical and not localized/business-friendly.
- Empty recipe error is too generic.
- Insufficient stock error only names the first ingredient and does not return a shortage list.
- There is no structured reason such as `MISSING_RECIPE`, `EMPTY_RECIPE`, or `INSUFFICIENT_STOCK`.

## Recipe model

Current model:

- `RecipeEntity` has `@OneToOne ProductVariantEntity productVariant`.
- DB table `recipes` has `product_variant_id`.
- DB has unique constraint `uk_recipes_product_variant`.

Conclusion:

- Recipe is correctly attached to Product Variant.
- Complete order correctly uses Product Variant recipe.

## Recipe ingredients

The only active recipe currently has ingredient rows:

- ingredient: Robusta Coffee Bean
- quantity: `10`
- unit: `gram`

No empty active recipe was found in the current runtime audit.

## Inventory / stock state

Store `1` currently has stock balances for only three ingredients:

| Ingredient | Available |
| --- | --- |
| Robusta Coffee Bean | `6000 gram` |
| Condensed Milk | `12000 ml` |
| Oolong Tea | `2500 gram` |

This is enough for the only active recipe found if the order uses variant `1` size `S`.

Most other products cannot be completed because their variants do not have recipes yet, before stock is even evaluated.

## POS current gap

POS currently loads public/admin product catalog and lets Staff select active variants.

POS does not know:

- whether a variant has an active recipe;
- whether a recipe has at least one ingredient;
- whether store stock is enough for at least one unit;
- why a product/variant should be disabled before selling.

Current guard only covers:

- product inactive;
- no variants;
- all variants inactive.

Therefore POS can create/pay orders that later fail when Staff presses complete.

## Admin Recipe UX current state

Admin Recipe page can:

- load products and variants;
- choose a Product Variant in the recipe form;
- add recipe ingredients;
- set recipe status active/inactive;
- create/update/delete recipes.

Missing:

- no visible list/count of variants without recipes;
- no warning in the variant dropdown for variants already missing recipe;
- no inventory availability/stock readiness indicator.

## Seed data gaps

Seed/demo data does create products, variants, ingredients, goods receipt/stock movements.

Gap:

- Product demo variants mostly do not have active recipes.
- Only one runtime recipe exists.
- Stock exists only for a small ingredient set.

The dataset is not sufficient for POS complete-order demo across the visible catalog.

## Backend changes needed

1. Add business-specific completion exception/response details:
   - `MISSING_RECIPE`
   - `EMPTY_RECIPE`
   - `INSUFFICIENT_STOCK`
2. Keep blocking completion when recipe or stock is missing.
3. Return HTTP `409 Conflict` with clear message.
4. For missing recipe/empty recipe, include:
   - `productId`
   - `productName`
   - `variantId`
   - `size`
   - `reason`
5. For insufficient stock, include shortage rows:
   - `ingredientId`
   - `ingredientName`
   - `requiredQuantity`
   - `availableQuantity`
   - `unit`
6. Add product variant availability service/API for store-scoped POS use.

## Frontend changes needed

1. POS should call a real availability API for the current Staff/Manager/Admin store.
2. Product/variant UI should show unavailable states:
   - missing recipe: "Mon nay chua co cong thuc"
   - empty recipe: "Cong thuc chua co nguyen lieu"
   - insufficient stock: "Khong du nguyen lieu"
3. POS should disable add-to-cart for unavailable variants.
4. If backend complete still returns `409`, POS should show the backend message instead of a generic technical error.
5. Admin Recipe should minimally show variants without active recipe so Admin knows what to configure.

## Proposed implementation direction

- Keep Recipe validation in complete-order. Do not bypass inventory deduction.
- Add `GET /api/v1/staff/products/availability` using authenticated user's assigned store.
- For ADMIN fallback, use `storeId` query param if provided; otherwise use first assigned/default branch if available.
- Topping inventory remains out of scope for V1.
- Add a small seed migration for at least one demo product variant if needed, without modifying old migrations.
