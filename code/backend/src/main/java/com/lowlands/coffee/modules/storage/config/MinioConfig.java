package com.lowlands.coffee.modules.storage.config;

import io.minio.MinioClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@EnableConfigurationProperties(StorageProperties.class)
public class MinioConfig {

    @Bean
    public MinioClient minioClient(StorageProperties storageProperties) {
        StorageProperties.Minio minio = storageProperties.getMinio();
        requireText(minio.getEndpoint(), "MINIO_ENDPOINT");
        requireText(minio.getAccessKey(), "MINIO_ACCESS_KEY");
        requireText(minio.getSecretKey(), "MINIO_SECRET_KEY");
        requireText(minio.getBucket(), "MINIO_BUCKET");
        requireText(storageProperties.getPublicBaseUrl(), "MINIO_PUBLIC_BASE_URL");

        return MinioClient.builder()
                .endpoint(minio.getEndpoint())
                .credentials(minio.getAccessKey(), minio.getSecretKey())
                .build();
    }

    private void requireText(String value, String variableName) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(variableName + " is required for MinIO storage configuration");
        }
    }
}
