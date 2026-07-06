package com.lowlands.coffee.modules.storage.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StorageUploadResponse {

    private final String objectKey;
    private final String url;
    private final String contentType;
    private final long size;
}
