package com.lowlands.coffee.modules.storage.service;

import com.lowlands.coffee.modules.storage.dto.StorageUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    StorageUploadResponse upload(MultipartFile file, String folder);
}
