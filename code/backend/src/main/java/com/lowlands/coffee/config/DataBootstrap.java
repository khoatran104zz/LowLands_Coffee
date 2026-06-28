package com.lowlands.coffee.config;

import com.lowlands.coffee.modules.ingredient.entity.IngredientCategoryEntity;
import com.lowlands.coffee.modules.ingredient.entity.IngredientEntity;
import com.lowlands.coffee.modules.ingredient.repository.IngredientCategoryRepository;
import com.lowlands.coffee.modules.ingredient.repository.IngredientRepository;
import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptEntity;
import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptItemEntity;
import com.lowlands.coffee.modules.inventory.entity.StockMovementEntity;
import com.lowlands.coffee.modules.inventory.repository.GoodsReceiptRepository;
import com.lowlands.coffee.modules.inventory.repository.StockMovementRepository;
import com.lowlands.coffee.modules.role.entity.RoleEntity;
import com.lowlands.coffee.modules.role.repository.RoleRepository;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.entity.StoreUserEntity;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.supplier.entity.SupplierEntity;
import com.lowlands.coffee.modules.supplier.repository.SupplierRepository;
import com.lowlands.coffee.modules.user.entity.UserEntity;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@EnableConfigurationProperties(BootstrapProperties.class)
public class DataBootstrap {

    @Bean
    public ApplicationRunner bootstrapSystemData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            StoreRepository storeRepository,
            StoreUserRepository storeUserRepository,
            SupplierRepository supplierRepository,
            IngredientCategoryRepository ingredientCategoryRepository,
            IngredientRepository ingredientRepository,
            GoodsReceiptRepository goodsReceiptRepository,
            StockMovementRepository stockMovementRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            UserEntity admin = ensureUser(
                    "Lowlands Admin",
                    "admin@lowlands.coffee",
                    "0900000001",
                    "Admin@123",
                    "ADMIN",
                    roleRepository,
                    userRepository,
                    passwordEncoder
            );
            UserEntity manager = ensureUser(
                    "Lowlands Manager",
                    "manager@lowlands.coffee",
                    "0900000002",
                    "Manager@123",
                    "MANAGER",
                    roleRepository,
                    userRepository,
                    passwordEncoder
            );
            UserEntity staff = ensureUser(
                    "Lowlands Staff",
                    "staff@lowlands.coffee",
                    "0900000003",
                    "Staff@123",
                    "STAFF",
                    roleRepository,
                    userRepository,
                    passwordEncoder
            );
            ensureUser(
                    "Lowlands Customer",
                    "customer@lowlands.coffee",
                    "0900000004",
                    "Customer@123",
                    "CUSTOMER",
                    roleRepository,
                    userRepository,
                    passwordEncoder
            );

            StoreEntity defaultStore = ensureDefaultStore(storeRepository);
            ensureStoreUser(manager, defaultStore, "MANAGER", storeUserRepository);
            ensureStoreUser(staff, defaultStore, "CASHIER", storeUserRepository);
            ensureStoreUser(admin, defaultStore, "MANAGER", storeUserRepository);
            ensureDemoInventory(
                    admin,
                    defaultStore,
                    supplierRepository,
                    ingredientCategoryRepository,
                    ingredientRepository,
                    goodsReceiptRepository,
                    stockMovementRepository
            );
        };
    }

    private UserEntity ensureUser(
            String fullName,
            String email,
            String phone,
            String password,
            String roleName,
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            RoleEntity role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new IllegalStateException(roleName + " role is missing"));
            UserEntity user = new UserEntity();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPhone(phone);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setStatus("ACTIVE");
            return userRepository.save(user);
        });
    }

    private StoreEntity ensureDefaultStore(StoreRepository storeRepository) {
        return storeRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    StoreEntity store = new StoreEntity();
                    store.setName("Lowlands Coffee - Default Store");
                    store.setAddress("1 Nguyen Hue, District 1, Ho Chi Minh City");
                    store.setPhone("02838224466");
                    store.setStatus("active");
                    return storeRepository.save(store);
                });
    }

    private void ensureStoreUser(
            UserEntity user,
            StoreEntity store,
            String position,
            StoreUserRepository storeUserRepository
    ) {
        if (storeUserRepository.existsByUserIdAndStoreId(user.getId(), store.getId())) {
            return;
        }
        StoreUserEntity storeUser = new StoreUserEntity();
        storeUser.setUser(user);
        storeUser.setStore(store);
        storeUser.setPosition(position);
        storeUser.setStatus("active");
        storeUserRepository.save(storeUser);
    }

    private void ensureDemoInventory(
            UserEntity createdBy,
            StoreEntity store,
            SupplierRepository supplierRepository,
            IngredientCategoryRepository categoryRepository,
            IngredientRepository ingredientRepository,
            GoodsReceiptRepository goodsReceiptRepository,
            StockMovementRepository stockMovementRepository
    ) {
        if (goodsReceiptRepository.existsByReceiptCode("GR-DEMO-001")) {
            return;
        }

        SupplierEntity supplier = ensureSupplier(supplierRepository);
        IngredientCategoryEntity coffeeCategory = ensureIngredientCategory(
                "COFFEE",
                "Coffee",
                "Coffee beans and coffee base ingredients",
                categoryRepository
        );
        IngredientCategoryEntity dairyCategory = ensureIngredientCategory(
                "DAIRY",
                "Dairy",
                "Milk and cream ingredients",
                categoryRepository
        );
        IngredientCategoryEntity teaCategory = ensureIngredientCategory(
                "TEA",
                "Tea",
                "Tea leaves and fruit tea ingredients",
                categoryRepository
        );

        IngredientEntity robusta = ensureIngredient(
                "ROBUSTA_BEAN",
                "Robusta Coffee Bean",
                "gram",
                coffeeCategory,
                ingredientRepository
        );
        IngredientEntity condensedMilk = ensureIngredient(
                "CONDENSED_MILK",
                "Condensed Milk",
                "ml",
                dairyCategory,
                ingredientRepository
        );
        IngredientEntity oolongTea = ensureIngredient(
                "OOLONG_TEA",
                "Oolong Tea",
                "gram",
                teaCategory,
                ingredientRepository
        );

        GoodsReceiptEntity receipt = new GoodsReceiptEntity();
        receipt.setSupplier(supplier);
        receipt.setStore(store);
        receipt.setCreatedBy(createdBy);
        receipt.setReceiptCode("GR-DEMO-001");
        receipt.setStatus("COMPLETED");
        receipt.setNote("Bootstrap demo inventory");
        addReceiptItem(receipt, robusta, "gram", "6000", "180");
        addReceiptItem(receipt, condensedMilk, "ml", "12000", "45");
        addReceiptItem(receipt, oolongTea, "gram", "2500", "120");
        receipt.setTotalAmount(receipt.getItems().stream()
                .map(GoodsReceiptItemEntity::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        GoodsReceiptEntity savedReceipt = goodsReceiptRepository.save(receipt);
        savedReceipt.getItems().forEach(item -> stockMovementRepository.save(
                createStockInMovement(store, createdBy, savedReceipt, item)
        ));
    }

    private SupplierEntity ensureSupplier(SupplierRepository supplierRepository) {
        return supplierRepository.findByCode("SUP-DEMO")
                .orElseGet(() -> {
                    SupplierEntity supplier = new SupplierEntity();
                    supplier.setCode("SUP-DEMO");
                    supplier.setName("Lowlands Demo Supplier");
                    supplier.setContactName("Demo Supply Team");
                    supplier.setPhone("02838224466");
                    supplier.setEmail("supplier@lowlands.coffee");
                    supplier.setAddress("Ho Chi Minh City");
                    supplier.setTaxCode("DEMO-TAX");
                    supplier.setStatus("active");
                    return supplierRepository.save(supplier);
                });
    }

    private IngredientCategoryEntity ensureIngredientCategory(
            String code,
            String name,
            String description,
            IngredientCategoryRepository categoryRepository
    ) {
        return categoryRepository.findByCode(code)
                .orElseGet(() -> {
                    IngredientCategoryEntity category = new IngredientCategoryEntity();
                    category.setCode(code);
                    category.setName(name);
                    category.setDescription(description);
                    category.setStatus("active");
                    return categoryRepository.save(category);
                });
    }

    private IngredientEntity ensureIngredient(
            String code,
            String name,
            String unit,
            IngredientCategoryEntity category,
            IngredientRepository ingredientRepository
    ) {
        return ingredientRepository.findByCode(code)
                .orElseGet(() -> {
                    IngredientEntity ingredient = new IngredientEntity();
                    ingredient.setCode(code);
                    ingredient.setName(name);
                    ingredient.setUnit(unit);
                    ingredient.setCategory(category);
                    ingredient.setStatus("active");
                    return ingredientRepository.save(ingredient);
                });
    }

    private void addReceiptItem(
            GoodsReceiptEntity receipt,
            IngredientEntity ingredient,
            String unit,
            String quantity,
            String unitPrice
    ) {
        GoodsReceiptItemEntity item = new GoodsReceiptItemEntity();
        item.setReceipt(receipt);
        item.setIngredient(ingredient);
        item.setUnit(unit);
        item.setQuantity(new BigDecimal(quantity));
        item.setUnitPrice(new BigDecimal(unitPrice));
        item.setTotalPrice(item.getQuantity().multiply(item.getUnitPrice()));
        receipt.getItems().add(item);
    }

    private StockMovementEntity createStockInMovement(
            StoreEntity store,
            UserEntity createdBy,
            GoodsReceiptEntity receipt,
            GoodsReceiptItemEntity item
    ) {
        StockMovementEntity movement = new StockMovementEntity();
        movement.setStore(store);
        movement.setIngredient(item.getIngredient());
        movement.setMovementType("IN");
        movement.setQuantity(item.getQuantity());
        movement.setUnit(item.getUnit());
        movement.setReferenceType("GOODS_RECEIPT");
        movement.setReferenceId(receipt.getId());
        movement.setNote("Bootstrap goods receipt " + receipt.getReceiptCode());
        movement.setCreatedBy(createdBy);
        return movement;
    }
}
