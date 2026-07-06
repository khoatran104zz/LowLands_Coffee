package com.lowlands.coffee.modules.storage.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.storage.dto.StorageUploadResponse;
import com.lowlands.coffee.modules.storage.service.StorageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/storage")
public class StorageController {

    private static final String PRODUCT_IMAGE_FOLDER = "products";

    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/products/images")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PRODUCT_CREATE') or hasAuthority('PRODUCT_UPDATE')")
    public ApiResponse<StorageUploadResponse> uploadProductImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success("File uploaded", storageService.upload(file, PRODUCT_IMAGE_FOLDER));
    }
}
