package com.lowlands.coffee;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class MasterDataCompletionTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void activeVariantsHaveRecipesAndEnoughOpeningStock() {
        int activeVariants = count("""
                select count(*)
                from product_variants pv
                join products p on p.id = pv.product_id
                join categories c on c.id = p.category_id
                where pv.status = 'active'
                  and p.status = 'active'
                  and c.status = 'active'
                """);
        int activeVariantsWithActiveRecipe = count("""
                select count(*)
                from product_variants pv
                join products p on p.id = pv.product_id
                join categories c on c.id = p.category_id
                join recipes r on r.product_variant_id = pv.id and r.status = 'active'
                where pv.status = 'active'
                  and p.status = 'active'
                  and c.status = 'active'
                """);
        int variantsWithMoreThanOneActiveRecipe = count("""
                select count(*)
                from (
                    select pv.id
                    from product_variants pv
                    join products p on p.id = pv.product_id
                    join categories c on c.id = p.category_id
                    join recipes r on r.product_variant_id = pv.id and r.status = 'active'
                    where pv.status = 'active'
                      and p.status = 'active'
                      and c.status = 'active'
                    group by pv.id
                    having count(r.id) > 1
                ) duplicated
                """);
        int emptyActiveRecipes = count("""
                select count(*)
                from (
                    select r.id
                    from recipes r
                    left join recipe_ingredients ri on ri.recipe_id = r.id
                    where r.status = 'active'
                    group by r.id
                    having count(ri.id) = 0
                ) empty_recipe
                """);
        int inactiveRecipeIngredients = count("""
                select count(*)
                from recipe_ingredients ri
                join recipes r on r.id = ri.recipe_id and r.status = 'active'
                join ingredients i on i.id = ri.ingredient_id
                where i.status <> 'active'
                """);
        int ingredientsWithoutStockMovement = count("""
                select count(*)
                from ingredients i
                where not exists (select 1 from stock_movements sm where sm.ingredient_id = i.id)
                """);
        int unavailableActiveVariants = count("""
                select count(*)
                from product_variants pv
                join products p on p.id = pv.product_id
                join categories c on c.id = p.category_id
                left join recipes r on r.product_variant_id = pv.id and r.status = 'active'
                where pv.status = 'active'
                  and p.status = 'active'
                  and c.status = 'active'
                  and (
                    r.id is null
                    or not exists (select 1 from recipe_ingredients ri where ri.recipe_id = r.id)
                    or exists (
                      select 1
                      from recipe_ingredients ri
                      join ingredients i on i.id = ri.ingredient_id
                      left join (
                        select ingredient_id,
                               sum(case
                                   when movement_type = 'IN' then quantity
                                   when movement_type = 'OUT' then -quantity
                                   else quantity
                               end) as current_stock
                        from stock_movements
                        where store_id = 1
                        group by ingredient_id
                      ) stock on stock.ingredient_id = i.id
                      where ri.recipe_id = r.id
                        and (
                            i.status <> 'active'
                            or lower(i.unit) <> lower(ri.unit)
                            or coalesce(stock.current_stock, 0) < ri.quantity
                        )
                    )
                  )
                """);

        assertThat(activeVariants).isGreaterThan(0);
        assertThat(activeVariantsWithActiveRecipe).isEqualTo(activeVariants);
        assertThat(variantsWithMoreThanOneActiveRecipe).isZero();
        assertThat(emptyActiveRecipes).isZero();
        assertThat(inactiveRecipeIngredients).isZero();
        assertThat(ingredientsWithoutStockMovement).isZero();
        assertThat(unavailableActiveVariants).isZero();
    }

    private int count(String sql) {
        Integer result = jdbcTemplate.query(sql, rs -> rs.next() ? rs.getInt(1) : 0);
        return result == null ? 0 : result;
    }
}
