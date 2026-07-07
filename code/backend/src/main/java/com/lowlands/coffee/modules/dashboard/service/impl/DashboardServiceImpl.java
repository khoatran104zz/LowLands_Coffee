package com.lowlands.coffee.modules.dashboard.service.impl;

import com.lowlands.coffee.modules.dashboard.dto.response.AdminDashboardSummaryResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.DashboardLowStockResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.DashboardRecentActivityResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.DashboardTrendPointResponse;
import com.lowlands.coffee.modules.dashboard.dto.response.ManagerDashboardSummaryResponse;
import com.lowlands.coffee.modules.inventory.entity.GoodsReceiptEntity;
import com.lowlands.coffee.modules.inventory.entity.StockMovementEntity;
import com.lowlands.coffee.modules.dashboard.service.DashboardService;
import com.lowlands.coffee.modules.inventory.repository.GoodsReceiptRepository;
import com.lowlands.coffee.modules.inventory.repository.StockMovementRepository;
import com.lowlands.coffee.modules.order.entity.OrderEntity;
import com.lowlands.coffee.modules.order.repository.OrderRepository;
import com.lowlands.coffee.modules.product.repository.ProductRepository;
import com.lowlands.coffee.modules.store.entity.StoreEntity;
import com.lowlands.coffee.modules.store.repository.StoreRepository;
import com.lowlands.coffee.modules.store.repository.StoreUserRepository;
import com.lowlands.coffee.modules.store.service.ManagerStoreContextService;
import com.lowlands.coffee.modules.user.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final StoreUserRepository storeUserRepository;
    private final StockMovementRepository stockMovementRepository;
    private final OrderRepository orderRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final ManagerStoreContextService managerStoreContextService;

    public DashboardServiceImpl(
            UserRepository userRepository,
            StoreRepository storeRepository,
            ProductRepository productRepository,
            StoreUserRepository storeUserRepository,
            StockMovementRepository stockMovementRepository,
            OrderRepository orderRepository,
            GoodsReceiptRepository goodsReceiptRepository,
            ManagerStoreContextService managerStoreContextService
    ) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.storeUserRepository = storeUserRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.orderRepository = orderRepository;
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.managerStoreContextService = managerStoreContextService;
    }

    @Override
    public AdminDashboardSummaryResponse getAdminSummary(Long storeId) {
        TimeWindows windows = currentTimeWindows();
        return AdminDashboardSummaryResponse.builder()
                .totalUsers(userRepository.count())
                .totalStores(storeId == null ? storeRepository.count() : 1)
                .totalProducts(productRepository.count())
                .totalOrders(orderRepository.countByOptionalStoreId(storeId))
                .totalRevenue(orderRepository.sumPaidCompletedRevenue(storeId))
                .todayRevenue(orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.todayStart(), windows.todayEnd()))
                .weekRevenue(orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.weekStart(), windows.todayEnd()))
                .monthRevenue(orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.monthStart(), windows.todayEnd()))
                .yearRevenue(orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.yearStart(), windows.todayEnd()))
                .ordersToday(orderRepository.countByOptionalStoreIdAndCreatedAtBetween(storeId, windows.todayStart(), windows.todayEnd()))
                .completedOrdersToday(orderRepository.countByStatusAndOptionalStoreIdAndCreatedAtBetween("COMPLETED", storeId, windows.todayStart(), windows.todayEnd()))
                .cancelledOrdersToday(orderRepository.countByStatusAndOptionalStoreIdAndCreatedAtBetween("CANCELLED", storeId, windows.todayStart(), windows.todayEnd()))
                .completedOrders(orderRepository.countByStatusAndOptionalStoreId("COMPLETED", storeId))
                .cancelledOrders(orderRepository.countByStatusAndOptionalStoreId("CANCELLED", storeId))
                .lowStockCount(countLowStockItems(storeId))
                .paymentBreakdown(orderRepository.findPaymentBreakdownForPaidCompletedOrders(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd()
                ))
                .topProducts(orderRepository.findTopProductsByPaidCompletedRevenue(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd(),
                        PageRequest.of(0, 5)
                ))
                .topCategories(orderRepository.findTopCategoriesByPaidCompletedRevenue(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd(),
                        PageRequest.of(0, 5)
                ))
                .storeRanking(orderRepository.findStoreRankingByPaidCompletedRevenue(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd(),
                        PageRequest.of(0, 10)
                ))
                .revenueTrend(buildSevenDayTrend(storeId, windows.todayStart()))
                .orderTrend(buildSevenDayTrend(storeId, windows.todayStart()))
                .lowStockItems(findLowStockItems(storeId, 5))
                .recentActivities(findRecentActivities(storeId, 8))
                .build();
    }

    @Override
    public ManagerDashboardSummaryResponse getManagerSummary(String managerEmail) {
        StoreEntity store = managerStoreContextService.getCurrentManagerStore();
        Long storeId = store.getId();

        long inventoryItems = stockMovementRepository.countDistinctIngredientsByStoreId(storeId);
        long lowStockItems = countLowStockItems(storeId);
        TimeWindows windows = currentTimeWindows();

        long todayOrders = orderRepository.countByStoreIdAndCreatedAtBetween(storeId, windows.todayStart(), windows.todayEnd());
        BigDecimal todayRevenue = orderRepository.sumPaidCompletedRevenueBetween(storeId, windows.todayStart(), windows.todayEnd());
        long preparingOrders = orderRepository.countByStoreIdAndStatus(storeId, "PREPARING");
        long readyOrders = orderRepository.countByStoreIdAndStatus(storeId, "READY");
        long completedOrders = orderRepository.countByStoreIdAndStatusAndCreatedAtBetween(
                storeId,
                "COMPLETED",
                windows.todayStart(),
                windows.todayEnd()
        );

        long activeStaff = storeUserRepository.findByStoreId(storeId).stream()
                .filter(su -> "active".equalsIgnoreCase(su.getStatus()))
                .filter(su -> {
                    String role = su.getUser().getRole().getName();
                    return "STAFF".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role);
                })
                .count();

        long todayGoodsReceipts = goodsReceiptRepository.countByStoreIdAndCreatedAtBetween(
                storeId,
                windows.todayStart(),
                windows.todayEnd()
        );
        long todayStockAdjustments = stockMovementRepository.countByStoreIdAndMovementTypeAndCreatedAtBetween(
                storeId,
                "ADJUSTMENT",
                windows.todayStart(),
                windows.todayEnd()
        );

        BigDecimal yesterdayRevenue = orderRepository.sumPaidCompletedRevenueBetween(
                storeId,
                windows.yesterdayStart(),
                windows.yesterdayEnd()
        );
        BigDecimal thisWeekRevenue = orderRepository.sumPaidCompletedRevenueBetween(
                storeId,
                windows.weekStart(),
                windows.todayEnd()
        );
        BigDecimal thisMonthRevenue = orderRepository.sumPaidCompletedRevenueBetween(
                storeId,
                windows.monthStart(),
                windows.todayEnd()
        );

        return ManagerDashboardSummaryResponse.builder()
                .storeId(storeId)
                .storeName(store.getName())
                .totalProducts(productRepository.count())
                .inventoryItems(inventoryItems)
                .lowStockItems(lowStockItems)
                .lowStockCount(lowStockItems)
                .inventoryAlerts(lowStockItems)
                .totalOrders(orderRepository.countByStoreId(storeId))
                .totalRevenue(orderRepository.sumPaidCompletedRevenue(storeId))
                .todayOrders(todayOrders)
                .todayRevenue(todayRevenue)
                .preparingOrders(preparingOrders)
                .readyOrders(readyOrders)
                .completedOrders(completedOrders)
                .activeStaff(activeStaff)
                .staffCount(activeStaff)
                .todayGoodsReceipts(todayGoodsReceipts)
                .todayStockAdjustments(todayStockAdjustments)
                .yesterdayRevenue(yesterdayRevenue)
                .thisWeekRevenue(thisWeekRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .topProducts(orderRepository.findTopProductsByPaidCompletedRevenue(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd(),
                        PageRequest.of(0, 5)
                ))
                .paymentBreakdown(orderRepository.findPaymentBreakdownForPaidCompletedOrders(
                        storeId,
                        windows.yearStart(),
                        windows.todayEnd()
                ))
                .revenueTrend(buildSevenDayTrend(storeId, windows.todayStart()))
                .orderTrend(buildSevenDayTrend(storeId, windows.todayStart()))
                .lowStockItemsList(findLowStockItems(storeId, 5))
                .ingredientConsumption(stockMovementRepository.findIngredientConsumptionByStore(
                        storeId,
                        windows.weekStart(),
                        windows.todayEnd(),
                        PageRequest.of(0, 5)
                ))
                .recentActivities(findRecentActivities(storeId, 8))
                .build();
    }

    private long countLowStockItems(Long storeId) {
        return stockBalances(storeId).stream()
                .filter(balance -> {
                    BigDecimal minStock = minStock(balance);
                    BigDecimal currentStock = (BigDecimal) balance[7];
                    return currentStock.compareTo(minStock) <= 0;
                })
                .count();
    }

    private List<DashboardLowStockResponse> findLowStockItems(Long storeId, int limit) {
        return stockBalances(storeId).stream()
                .filter(balance -> {
                    BigDecimal minStock = minStock(balance);
                    BigDecimal currentStock = (BigDecimal) balance[7];
                    return currentStock.compareTo(minStock) <= 0;
                })
                .sorted(Comparator.comparing(balance -> (BigDecimal) balance[7]))
                .limit(limit)
                .map(balance -> new DashboardLowStockResponse(
                        (Long) balance[0],
                        (String) balance[1],
                        (Long) balance[2],
                        (String) balance[3],
                        (String) balance[4],
                        (String) balance[5],
                        minStock(balance),
                        (BigDecimal) balance[7]
                ))
                .toList();
    }

    private List<Object[]> stockBalances(Long storeId) {
        if (storeId == null) {
            return stockMovementRepository.calculateAllStockBalances();
        }
        return stockMovementRepository.calculateStockBalancesByStoreId(storeId);
    }

    private BigDecimal minStock(Object[] balance) {
        BigDecimal minStock = (BigDecimal) balance[6];
        return minStock == null ? BigDecimal.ZERO : minStock;
    }

    private List<DashboardTrendPointResponse> buildSevenDayTrend(Long storeId, LocalDateTime todayStart) {
        List<DashboardTrendPointResponse> points = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime start = todayStart.minusDays(i);
            LocalDateTime end = start.plusDays(1);
            LocalDate date = start.toLocalDate();
            points.add(new DashboardTrendPointResponse(
                    date,
                    date.getDayOfMonth() + "/" + date.getMonthValue(),
                    orderRepository.sumPaidCompletedRevenueBetween(storeId, start, end),
                    orderRepository.countByOptionalStoreIdAndCreatedAtBetween(storeId, start, end)
            ));
        }
        return points;
    }

    private List<DashboardRecentActivityResponse> findRecentActivities(Long storeId, int limit) {
        List<DashboardRecentActivityResponse> activities = new ArrayList<>();

        for (OrderEntity order : orderRepository.findRecentOrders(storeId, PageRequest.of(0, limit))) {
            activities.add(new DashboardRecentActivityResponse(
                    "ORDER",
                    "Order " + order.getOrderCode(),
                    "Status " + order.getStatus(),
                    order.getCreatedAt(),
                    order.getTotalAmount(),
                    order.getStore().getName()
            ));
        }

        for (GoodsReceiptEntity receipt : goodsReceiptRepository.findRecentGoodsReceipts(storeId, PageRequest.of(0, limit))) {
            activities.add(new DashboardRecentActivityResponse(
                    "GOODS_RECEIPT",
                    "Goods receipt " + receipt.getReceiptCode(),
                    "Status " + receipt.getStatus(),
                    receipt.getCreatedAt(),
                    receipt.getTotalAmount(),
                    receipt.getStore().getName()
            ));
        }

        for (StockMovementEntity movement : stockMovementRepository.findRecentMovements(storeId, PageRequest.of(0, limit))) {
            activities.add(new DashboardRecentActivityResponse(
                    "STOCK_MOVEMENT",
                    movement.getMovementType() + " " + movement.getIngredient().getName(),
                    movement.getQuantity().stripTrailingZeros().toPlainString() + " " + movement.getUnit(),
                    movement.getCreatedAt(),
                    null,
                    movement.getStore().getName()
            ));
        }

        return activities.stream()
                .sorted(Comparator.comparing(DashboardRecentActivityResponse::getCreatedAt).reversed())
                .limit(limit)
                .toList();
    }

    private TimeWindows currentTimeWindows() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.with(LocalTime.MIN);
        LocalDateTime todayEnd = now.with(LocalTime.MAX);
        LocalDateTime yesterdayStart = todayStart.minusDays(1);
        LocalDateTime yesterdayEnd = todayStart;
        LocalDateTime weekStart = todayStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime monthStart = todayStart.with(TemporalAdjusters.firstDayOfMonth());
        LocalDateTime yearStart = LocalDate.of(todayStart.getYear(), 1, 1).atStartOfDay();
        return new TimeWindows(
                todayStart,
                todayEnd,
                yesterdayStart,
                yesterdayEnd,
                weekStart,
                monthStart,
                yearStart
        );
    }

    private record TimeWindows(
            LocalDateTime todayStart,
            LocalDateTime todayEnd,
            LocalDateTime yesterdayStart,
            LocalDateTime yesterdayEnd,
            LocalDateTime weekStart,
            LocalDateTime monthStart,
            LocalDateTime yearStart
    ) {
    }
}
