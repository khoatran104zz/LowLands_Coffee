package com.lowlands.coffee.modules.product.service;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.modules.product.dto.request.ProductCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.ProductUpdateRequest;
import com.lowlands.coffee.modules.product.dto.request.ProductVariantCreateRequest;
import com.lowlands.coffee.modules.product.dto.request.ProductVariantUpdateRequest;
import com.lowlands.coffee.modules.product.entity.CategoryEntity;
import com.lowlands.coffee.modules.product.entity.ProductEntity;
import com.lowlands.coffee.modules.product.entity.ProductVariantEntity;
import com.lowlands.coffee.modules.product.entity.ToppingEntity;
import com.lowlands.coffee.modules.product.mapper.CategoryMapper;
import com.lowlands.coffee.modules.product.mapper.ProductMapper;
import com.lowlands.coffee.modules.product.repository.CategoryRepository;
import com.lowlands.coffee.modules.product.repository.ProductRepository;
import com.lowlands.coffee.modules.product.repository.ToppingRepository;
import com.lowlands.coffee.modules.product.service.impl.ProductServiceImpl;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ToppingRepository toppingRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void createActiveProductRejectsInactiveCategory() {
        ProductCreateRequest request = productCreateRequest("active");
        CategoryEntity inactiveCategory = category(1L, "inactive");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(inactiveCategory));

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Active product cannot be assigned to inactive category");
    }

    @Test
    void createActiveProductRejectsInactiveTopping() {
        ProductCreateRequest request = productCreateRequest("active");
        request.setToppingIds(List.of(10L));

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category(1L, "active")));
        when(toppingRepository.findAllById(List.of(10L))).thenReturn(List.of(topping(10L, "inactive")));

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Active product cannot be assigned inactive topping");
    }

    @Test
    void variantCreateRequestRejectsZeroPrice() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        ProductVariantCreateRequest variant = variantCreateRequest("M", "0.00", "active");

        assertThat(validator.validate(variant))
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("price"));
    }

    @Test
    void updatePreservesRequestedVariantIdAndInactivatesOmittedVariant() {
        ProductEntity product = product(1L, category(1L, "active"));
        ProductVariantEntity small = variant(101L, product, "S", "29000", "active");
        ProductVariantEntity medium = variant(102L, product, "M", "35000", "active");
        product.getVariants().add(small);
        product.getVariants().add(medium);

        ProductUpdateRequest request = new ProductUpdateRequest();
        request.setCategoryId(1L);
        request.setName("Phin Sua Da");
        request.setStatus("active");
        request.setVariants(List.of(variantUpdateRequest(101L, "S", "30000", "active")));
        request.setToppingIds(List.of());

        when(productRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category(1L, "active")));
        when(productRepository.save(any(ProductEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        productService.update(1L, request);

        assertThat(small.getId()).isEqualTo(101L);
        assertThat(small.getPrice()).isEqualByComparingTo("30000");
        assertThat(small.getStatus()).isEqualTo("active");
        assertThat(medium.getId()).isEqualTo(102L);
        assertThat(medium.getStatus()).isEqualTo("inactive");
    }

    private ProductCreateRequest productCreateRequest(String status) {
        ProductCreateRequest request = new ProductCreateRequest();
        request.setCategoryId(1L);
        request.setName("Phin Sua Da");
        request.setStatus(status);
        request.setVariants(List.of(variantCreateRequest("M", "35000", "active")));
        request.setToppingIds(List.of());
        return request;
    }

    private ProductVariantCreateRequest variantCreateRequest(String size, String price, String status) {
        ProductVariantCreateRequest request = new ProductVariantCreateRequest();
        request.setSize(size);
        request.setPrice(new BigDecimal(price));
        request.setStatus(status);
        return request;
    }

    private ProductVariantUpdateRequest variantUpdateRequest(Long id, String size, String price, String status) {
        ProductVariantUpdateRequest request = new ProductVariantUpdateRequest();
        request.setId(id);
        request.setSize(size);
        request.setPrice(new BigDecimal(price));
        request.setStatus(status);
        return request;
    }

    private CategoryEntity category(Long id, String status) {
        CategoryEntity category = new CategoryEntity();
        category.setId(id);
        category.setName("Coffee");
        category.setStatus(status);
        return category;
    }

    private ToppingEntity topping(Long id, String status) {
        ToppingEntity topping = new ToppingEntity();
        topping.setId(id);
        topping.setName("Coffee Jelly");
        topping.setPrice(BigDecimal.ZERO);
        topping.setStatus(status);
        return topping;
    }

    private ProductEntity product(Long id, CategoryEntity category) {
        ProductEntity product = new ProductEntity();
        product.setId(id);
        product.setCategory(category);
        product.setName("Phin Sua Da");
        product.setStatus("active");
        return product;
    }

    private ProductVariantEntity variant(
            Long id,
            ProductEntity product,
            String size,
            String price,
            String status
    ) {
        ProductVariantEntity variant = new ProductVariantEntity();
        variant.setId(id);
        variant.setProduct(product);
        variant.setSize(size);
        variant.setPrice(new BigDecimal(price));
        variant.setStatus(status);
        return variant;
    }
}
