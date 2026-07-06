package com.lowlands.coffee.modules.storage.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.modules.storage.config.StorageProperties;
import com.lowlands.coffee.modules.storage.dto.StorageUploadResponse;
import com.lowlands.coffee.modules.storage.exception.StorageException;
import com.lowlands.coffee.modules.storage.service.StorageService;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MinioStorageService implements StorageService {

    private final MinioClient minioClient;
    private final StorageProperties storageProperties;

    public MinioStorageService(MinioClient minioClient, StorageProperties storageProperties) {
        this.minioClient = minioClient;
        this.storageProperties = storageProperties;
    }

    @Override
    public StorageUploadResponse upload(MultipartFile file, String folder) {
        validateFile(file);
        String contentType = normalizeContentType(file.getContentType());
        String objectKey = buildObjectKey(folder, contentType);

        try {
            ensureBucketExists();
            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(storageProperties.getMinio().getBucket())
                        .object(objectKey)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(contentType)
                        .build());
            }
        } catch (Exception exception) {
            throw new StorageException("Unable to upload file to MinIO storage", exception);
        }

        return StorageUploadResponse.builder()
                .objectKey(objectKey)
                .url(buildPublicUrl(objectKey))
                .contentType(contentType)
                .size(file.getSize())
                .build();
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Upload file must not be empty");
        }
        if (file.getSize() > storageProperties.getMaxFileSize()) {
            throw new BadRequestException("Upload file exceeds maximum size");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (!allowedContentTypes().contains(contentType)) {
            throw new BadRequestException("Unsupported image content type");
        }
    }

    private Set<String> allowedContentTypes() {
        return storageProperties.getAllowedContentTypes().stream()
                .filter(StringUtils::hasText)
                .map(this::normalizeContentType)
                .collect(Collectors.toSet());
    }

    private String normalizeContentType(String contentType) {
        return contentType == null ? "" : contentType.trim().toLowerCase(Locale.ROOT);
    }

    private String buildObjectKey(String folder, String contentType) {
        LocalDate today = LocalDate.now();
        String cleanFolder = sanitizeFolder(folder);
        return "%s/%04d/%02d/%s.%s".formatted(
                cleanFolder,
                today.getYear(),
                today.getMonthValue(),
                UUID.randomUUID(),
                extensionFor(contentType)
        );
    }

    private String sanitizeFolder(String folder) {
        if (!StringUtils.hasText(folder)) {
            throw new BadRequestException("Storage folder is required");
        }
        String sanitized = folder.trim().replace("\\", "/");
        if (sanitized.startsWith("/") || sanitized.contains("..")) {
            throw new BadRequestException("Invalid storage folder");
        }
        return sanitized;
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> throw new BadRequestException("Unsupported image content type");
        };
    }

    private void ensureBucketExists() throws Exception {
        String bucket = storageProperties.getMinio().getBucket();
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder()
                .bucket(bucket)
                .build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder()
                    .bucket(bucket)
                    .build());
        }
    }

    private String buildPublicUrl(String objectKey) {
        String baseUrl = storageProperties.getPublicBaseUrl();
        if (baseUrl.endsWith("/")) {
            return baseUrl + objectKey;
        }
        return baseUrl + "/" + objectKey;
    }
}
