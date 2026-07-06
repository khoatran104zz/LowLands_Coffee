package com.lowlands.coffee.modules.storage.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    private String provider = "minio";
    private Minio minio = new Minio();
    private String publicBaseUrl;
    private long maxFileSize;
    private List<String> allowedContentTypes = new ArrayList<>();

    @Getter
    @Setter
    public static class Minio {
        private String endpoint;
        private String accessKey;
        private String secretKey;
        private String bucket;
    }
}
