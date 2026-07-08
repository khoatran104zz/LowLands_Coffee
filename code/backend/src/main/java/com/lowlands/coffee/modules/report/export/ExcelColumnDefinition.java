package com.lowlands.coffee.modules.report.export;

import java.util.function.Function;

public record ExcelColumnDefinition<T>(
        String header,
        ExcelValueType type,
        Function<T, Object> valueExtractor
) {
}
