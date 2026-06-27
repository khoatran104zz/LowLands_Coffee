package com.lowlands.coffee.modules.product.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MenuResponse {

    private final List<CategoryResponse> categories;
    private final List<ProductResponse> products;
}
