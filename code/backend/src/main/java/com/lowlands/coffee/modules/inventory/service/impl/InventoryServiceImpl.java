package com.lowlands.coffee.modules.inventory.service.impl;

import com.lowlands.coffee.common.exception.BadRequestException;
import com.lowlands.coffee.common.exception.DuplicateResourceException;
import com.lowlands.coffee.common.exception.ResourceNotFoundException;
import com.lowlands.coffee.modules.ingredient.entity.IngredientEntity;
import com.lowlands.coffee.modules.ingredient.repository.IngredientRepository;
import com.lowlands.coffee.modules.inventory.dto.request.GoodsReceiptCreateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.GoodsReceiptItemRequest;
import com.lowlands.coffee.modules.inventory.dto.request.GoodsReceiptUpdateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.ManagerGoodsReceiptCreateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.ManagerGoodsReceiptUpdateRequest;
import com.lowlands.coffee.modules.inventory.dto.request.ManagerStockAdjustmentRequest;
import com.lowlands.coffee.modules.inventory.dto.request.StockAdjustmentRequest;
import com.lowlands.coffee.modules.inventory.dto.response.GoodsReceiptResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockBalanceResponse;
import com.lowlands.coffee.modules.inventory.dto.response.StockMovementResponse;
import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptEntity;
import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptItemEntity;
import com.lowlands.coffee.modules.inventory.entity.StockMovementEntity;
import com.lowlands.coffee.modules.inventory.mapper.InventoryMapper;
import com.lowlands.coffee.modules.inventory.repository.GoodsReceiptRepository;
import com.lowlands.coffee.modules.inventory.repository.StockMovementRepository;
import com.lowlands.coffee.modules.inventory.service.InventoryService;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.supplier.entity.SupplierEntity;
import com.lowlands.coffee.modules.supplier.repository.SupplierRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import com.lowlands.coffee.modules.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);

    private static final String DRAFT = "DRAFT";
    private static final String PENDING = "PENDING";
    private static final String COMPLETED = "COMPLETED";
    private static final String CANCELLED = "CANCELLED";
    private static final String IN = "IN";
    private static final String ADJUSTMENT = "ADJUSTMENT";
    private static final String GOODS_RECEIPT = "GOODS_RECEIPT";
    private static final String MANUAL_ADJUSTMENT = "MANUAL_ADJUSTMENT";

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SupplierRepository supplierRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryMapper inventoryMapper;
    private final NotificationService notificationService;

    public InventoryServiceImpl(
            GoodsReceiptRepository goodsReceiptRepository,
            StockMovementRepository stockMovementRepository,
            SupplierRepository supplierRepository,
            StoreRepository storeRepository,
            UserRepository userRepository,
            IngredientRepository ingredientRepository,
            InventoryMapper inventoryMapper,
            NotificationService notificationService
    ) {
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.supplierRepository = supplierRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.ingredientRepository = ingredientRepository;
        this.inventoryMapper = inventoryMapper;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoodsReceiptResponse> findGoodsReceipts() {
        return goodsReceiptRepository.findAll().stream()
                .map(inventoryMapper::toGoodsReceiptResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoodsReceiptResponse> findGoodsReceiptsByStore(Long storeId) {
        return goodsReceiptRepository.findByStoreId(storeId).stream()
                .map(inventoryMapper::toGoodsReceiptResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GoodsReceiptResponse findGoodsReceiptById(Long id) {
        return inventoryMapper.toGoodsReceiptResponse(getGoodsReceipt(id));
    }

    @Override
    @Transactional(readOnly = true)
    public GoodsReceiptResponse findGoodsReceiptByIdForStore(Long id, Long storeId) {
        GoodsReceiptEntity receipt = getGoodsReceipt(id);
        ensureReceiptStore(receipt, storeId);
        return inventoryMapper.toGoodsReceiptResponse(receipt);
    }

    @Override
    public GoodsReceiptResponse createGoodsReceipt(GoodsReceiptCreateRequest request) {
        validateReceiptItems(request.getItems());
        String receiptCode = request.getReceiptCode().trim();
        if (goodsReceiptRepository.existsByReceiptCode(receiptCode)) {
            throw new DuplicateResourceException("Goods receipt code already exists");
        }
        GoodsReceiptEntity receipt = new GoodsReceiptEntity();
        receipt.setSupplier(getSupplier(request.getSupplierId()));
        receipt.setStore(getStore(request.getStoreId()));
        receipt.setCreatedBy(getUser(request.getCreatedById()));
        receipt.setReceiptCode(receiptCode);
        receipt.setStatus(DRAFT);
        receipt.setNote(clean(request.getNote()));
        replaceReceiptItems(receipt, request.getItems());
        receipt.setTotalAmount(calculateTotal(receipt));
        return inventoryMapper.toGoodsReceiptResponse(goodsReceiptRepository.save(receipt));
    }

    @Override
    public GoodsReceiptResponse createManagerGoodsReceipt(
            ManagerGoodsReceiptCreateRequest request,
            Long storeId,
            Long createdById
    ) {
        validateReceiptItems(request.getItems());
        String receiptCode = request.getReceiptCode().trim();
        if (goodsReceiptRepository.existsByReceiptCode(receiptCode)) {
            throw new DuplicateResourceException("Goods receipt code already exists");
        }
        GoodsReceiptEntity receipt = new GoodsReceiptEntity();
        receipt.setSupplier(getSupplier(request.getSupplierId()));
        receipt.setStore(getStore(storeId));
        receipt.setCreatedBy(getUser(createdById));
        receipt.setReceiptCode(receiptCode);
        receipt.setStatus(PENDING);
        receipt.setNote(clean(request.getNote()));
        replaceReceiptItems(receipt, request.getItems());
        receipt.setTotalAmount(calculateTotal(receipt));
        GoodsReceiptResponse response = inventoryMapper.toGoodsReceiptResponse(goodsReceiptRepository.save(receipt));

        // Notify Admins!
        notificationService.createNotification(
                "Yêu cầu nhập kho mới",
                "Quản lý chi nhánh " + receipt.getStore().getName() + " đã tạo yêu cầu nhập kho mới " + receiptCode + ".",
                "IMPORT_REQUEST",
                receipt.getCreatedBy().getFullName(),
                null,
                "ADMIN",
                null,
                "/admin/import-notes"
        );

        return response;
    }

    @Override
    public GoodsReceiptResponse updateGoodsReceipt(Long id, GoodsReceiptUpdateRequest request) {
        validateReceiptItems(request.getItems());
        GoodsReceiptEntity receipt = getGoodsReceipt(id);
        ensureDraftOrPending(receipt);
        String receiptCode = request.getReceiptCode().trim();
        if (goodsReceiptRepository.existsByReceiptCodeAndIdNot(receiptCode, id)) {
            throw new DuplicateResourceException("Goods receipt code already exists");
        }
        receipt.setSupplier(getSupplier(request.getSupplierId()));
        receipt.setStore(getStore(request.getStoreId()));
        receipt.setCreatedBy(getUser(request.getCreatedById()));
        receipt.setReceiptCode(receiptCode);
        receipt.setNote(clean(request.getNote()));
        receipt.getItems().clear();
        replaceReceiptItems(receipt, request.getItems());
        receipt.setTotalAmount(calculateTotal(receipt));
        return inventoryMapper.toGoodsReceiptResponse(goodsReceiptRepository.save(receipt));
    }

    @Override
    public GoodsReceiptResponse updateManagerGoodsReceipt(
            Long id,
            ManagerGoodsReceiptUpdateRequest request,
            Long storeId,
            Long updatedById
    ) {
        validateReceiptItems(request.getItems());
        GoodsReceiptEntity receipt = getGoodsReceipt(id);
        ensureReceiptStore(receipt, storeId);
        ensureDraftOrPending(receipt);
        String receiptCode = request.getReceiptCode().trim();
        if (goodsReceiptRepository.existsByReceiptCodeAndIdNot(receiptCode, id)) {
            throw new DuplicateResourceException("Goods receipt code already exists");
        }
        receipt.setSupplier(getSupplier(request.getSupplierId()));
        receipt.setCreatedBy(getUser(updatedById));
        receipt.setReceiptCode(receiptCode);
        receipt.setNote(clean(request.getNote()));
        receipt.getItems().clear();
        replaceReceiptItems(receipt, request.getItems());
        receipt.setTotalAmount(calculateTotal(receipt));
        return inventoryMapper.toGoodsReceiptResponse(goodsReceiptRepository.save(receipt));
    }

    @Override
    public void deleteGoodsReceipt(Long id) {
        GoodsReceiptEntity receipt = getGoodsReceipt(id);
        ensureDraftOrPending(receipt);
        receipt.setStatus(CANCELLED);
        goodsReceiptRepository.save(receipt);
    }

    @Override
    public GoodsReceiptResponse completeGoodsReceipt(Long id) {
        GoodsReceiptEntity receipt = getGoodsReceipt(id);
        ensureDraftOrPending(receipt);
        receipt.setStatus(COMPLETED);
        GoodsReceiptEntity savedReceipt = goodsReceiptRepository.save(receipt);
        savedReceipt.getItems().forEach(item -> stockMovementRepository.save(
                createReceiptMovement(savedReceipt, item)
        ));
        log.info(
                "Goods receipt completed: receiptId={}, receiptCode={}, storeId={}, itemCount={}",
                savedReceipt.getId(),
                savedReceipt.getReceiptCode(),
                savedReceipt.getStore().getId(),
                savedReceipt.getItems().size()
        );

        // Notify the Manager who requested it!
        notificationService.createNotification(
                "Yêu cầu nhập kho được duyệt",
                "Yêu cầu nhập kho " + savedReceipt.getReceiptCode() + " đã được Admin phê duyệt thành công.",
                "IMPORT_APPROVED",
                "Admin Hệ thống",
                savedReceipt.getCreatedBy().getId(),
                null,
                null,
                "/manager/inventory/import-notes"
        );

        return inventoryMapper.toGoodsReceiptResponse(savedReceipt);
    }

    @Override
    public GoodsReceiptResponse completeManagerGoodsReceipt(Long id, Long storeId) {
        GoodsReceiptEntity receipt = getGoodsReceipt(id);
        ensureReceiptStore(receipt, storeId);
        if (COMPLETED.equals(receipt.getStatus())) {
            if (stockMovementRepository.existsByMovementTypeAndReferenceTypeAndReferenceId(IN, GOODS_RECEIPT, receipt.getId())) {
                return inventoryMapper.toGoodsReceiptResponse(receipt);
            }
            throw new com.lowlands.coffee.common.exception.ConflictException(
                    "Completed goods receipt is missing stock movements"
            );
        }
        ensureDraftOrPending(receipt);
        receipt.setStatus(COMPLETED);
        GoodsReceiptEntity savedReceipt = goodsReceiptRepository.save(receipt);
        if (!stockMovementRepository.existsByMovementTypeAndReferenceTypeAndReferenceId(IN, GOODS_RECEIPT, savedReceipt.getId())) {
            savedReceipt.getItems().forEach(item -> stockMovementRepository.save(
                    createReceiptMovement(savedReceipt, item)
            ));
        }
        log.info(
                "Manager goods receipt completed: receiptId={}, receiptCode={}, storeId={}, itemCount={}",
                savedReceipt.getId(),
                savedReceipt.getReceiptCode(),
                savedReceipt.getStore().getId(),
                savedReceipt.getItems().size()
        );
        return inventoryMapper.toGoodsReceiptResponse(savedReceipt);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponse> findStockMovements() {
        return stockMovementRepository.findAll().stream()
                .map(inventoryMapper::toStockMovementResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponse> findStockMovementsByStore(Long storeId) {
        return stockMovementRepository.findByStoreIdOrderByCreatedAtDesc(storeId).stream()
                .map(inventoryMapper::toStockMovementResponse)
                .toList();
    }

    @Override
    public StockMovementResponse createManualAdjustment(StockAdjustmentRequest request) {
        if (BigDecimal.ZERO.compareTo(request.getQuantity()) == 0) {
            throw new BadRequestException("Adjustment quantity must not be zero");
        }
        StockMovementEntity movement = new StockMovementEntity();
        movement.setStore(getStore(request.getStoreId()));
        movement.setIngredient(getIngredient(request.getIngredientId()));
        movement.setMovementType(ADJUSTMENT);
        movement.setQuantity(request.getQuantity());
        movement.setUnit(request.getUnit().trim());
        movement.setReferenceType(MANUAL_ADJUSTMENT);
        movement.setReferenceId(null);
        movement.setNote(clean(request.getNote()));
        movement.setCreatedBy(getUser(request.getCreatedById()));
        StockMovementEntity savedMovement = stockMovementRepository.save(movement);
        log.info(
                "Stock adjustment created: movementId={}, storeId={}, ingredientId={}, quantity={}",
                savedMovement.getId(),
                savedMovement.getStore().getId(),
                savedMovement.getIngredient().getId(),
                savedMovement.getQuantity()
        );
        return inventoryMapper.toStockMovementResponse(savedMovement);
    }

    @Override
    public StockMovementResponse createManagerManualAdjustment(
            ManagerStockAdjustmentRequest request,
            Long storeId,
            Long createdById
    ) {
        if (BigDecimal.ZERO.compareTo(request.getQuantity()) == 0) {
            throw new BadRequestException("Adjustment quantity must not be zero");
        }
        StockMovementEntity movement = new StockMovementEntity();
        movement.setStore(getStore(storeId));
        movement.setIngredient(getIngredient(request.getIngredientId()));
        movement.setMovementType(ADJUSTMENT);
        movement.setQuantity(request.getQuantity());
        movement.setUnit(request.getUnit().trim());
        movement.setReferenceType(MANUAL_ADJUSTMENT);
        movement.setReferenceId(null);
        movement.setNote(clean(request.getNote()));
        movement.setCreatedBy(getUser(createdById));
        StockMovementEntity savedMovement = stockMovementRepository.save(movement);
        log.info(
                "Manager stock adjustment created: movementId={}, storeId={}, ingredientId={}, quantity={}",
                savedMovement.getId(),
                savedMovement.getStore().getId(),
                savedMovement.getIngredient().getId(),
                savedMovement.getQuantity()
        );
        return inventoryMapper.toStockMovementResponse(savedMovement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockBalanceResponse> getStockBalances() {
        return stockMovementRepository.calculateAllStockBalances().stream()
                .map(inventoryMapper::toStockBalanceResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockBalanceResponse> getStockBalancesByStore(Long storeId) {
        return stockMovementRepository.calculateStockBalancesByStoreId(storeId).stream()
                .map(inventoryMapper::toStockBalanceResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StockBalanceResponse getStockBalance(Long storeId, Long ingredientId) {
        StoreEntity store = getStore(storeId);
        IngredientEntity ingredient = getIngredient(ingredientId);
        StockBalanceResponse response = new StockBalanceResponse();
        response.setStoreId(store.getId());
        response.setStoreName(store.getName());
        response.setIngredientId(ingredient.getId());
        response.setIngredientCode(ingredient.getCode());
        response.setIngredientName(ingredient.getName());
        response.setUnit(ingredient.getUnit());
        response.setMinStock(ingredient.getMinStock());
        response.setCurrentStock(stockMovementRepository.calculateCurrentStock(storeId, ingredientId));
        return response;
    }

    private GoodsReceiptEntity getGoodsReceipt(Long id) {
        return goodsReceiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goods receipt not found"));
    }

    private SupplierEntity getSupplier(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
    }

    private StoreEntity getStore(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));
    }

    private UserEntity getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private IngredientEntity getIngredient(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));
    }

    private void ensureDraftOrPending(GoodsReceiptEntity receipt) {
        if (!DRAFT.equals(receipt.getStatus()) && !PENDING.equals(receipt.getStatus())) {
            throw new BadRequestException("Only draft or pending goods receipt can be changed");
        }
    }

    private void ensureReceiptStore(GoodsReceiptEntity receipt, Long storeId) {
        if (!receipt.getStore().getId().equals(storeId)) {
            throw new org.springframework.security.access.AccessDeniedException("Goods receipt store access denied");
        }
    }

    private void replaceReceiptItems(GoodsReceiptEntity receipt, List<GoodsReceiptItemRequest> items) {
        items.forEach(item -> {
            GoodsReceiptItemEntity receiptItem = new GoodsReceiptItemEntity();
            receiptItem.setReceipt(receipt);
            receiptItem.setIngredient(getIngredient(item.getIngredientId()));
            receiptItem.setQuantity(item.getQuantity());
            receiptItem.setUnit(item.getUnit().trim());
            receiptItem.setUnitPrice(item.getUnitPrice());
            receiptItem.setTotalPrice(item.getQuantity().multiply(item.getUnitPrice()));
            receipt.getItems().add(receiptItem);
        });
    }

    private BigDecimal calculateTotal(GoodsReceiptEntity receipt) {
        return receipt.getItems().stream()
                .map(GoodsReceiptItemEntity::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private StockMovementEntity createReceiptMovement(
            GoodsReceiptEntity receipt,
            GoodsReceiptItemEntity item
    ) {
        StockMovementEntity movement = new StockMovementEntity();
        movement.setStore(receipt.getStore());
        movement.setIngredient(item.getIngredient());
        movement.setMovementType(IN);
        movement.setQuantity(item.getQuantity());
        movement.setUnit(item.getUnit());
        movement.setReferenceType(GOODS_RECEIPT);
        movement.setReferenceId(receipt.getId());
        movement.setNote("Goods receipt " + receipt.getReceiptCode());
        movement.setCreatedBy(receipt.getCreatedBy());
        return movement;
    }

    private void validateReceiptItems(List<GoodsReceiptItemRequest> items) {
        Set<Long> ingredientIds = new HashSet<>();
        for (GoodsReceiptItemRequest item : items) {
            if (!ingredientIds.add(item.getIngredientId())) {
                throw new BadRequestException("Ingredient must be unique per goods receipt");
            }
        }
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
