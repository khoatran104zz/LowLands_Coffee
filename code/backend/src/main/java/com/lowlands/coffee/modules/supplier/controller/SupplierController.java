package com.lowlands.coffee.modules.supplier.controller;

import com.lowlands.coffee.common.ApiResponse;
import com.lowlands.coffee.modules.supplier.dto.request.SupplierCreateRequest;
import com.lowlands.coffee.modules.supplier.dto.request.SupplierUpdateRequest;
import com.lowlands.coffee.modules.supplier.dto.response.SupplierResponse;
import com.lowlands.coffee.modules.supplier.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SUPPLIER_VIEW')")
    public ApiResponse<List<SupplierResponse>> findAll() {
        return ApiResponse.success(supplierService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_VIEW')")
    public ApiResponse<SupplierResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(supplierService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('SUPPLIER_CREATE')")
    public ApiResponse<SupplierResponse> create(@Valid @RequestBody SupplierCreateRequest request) {
        return ApiResponse.success("Supplier created", supplierService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_UPDATE')")
    public ApiResponse<SupplierResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SupplierUpdateRequest request
    ) {
        return ApiResponse.success(supplierService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER_DELETE')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ApiResponse.success(null);
    }
}
