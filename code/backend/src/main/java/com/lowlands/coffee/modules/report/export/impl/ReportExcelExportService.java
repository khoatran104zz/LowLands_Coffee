package com.lowlands.coffee.modules.report.export.impl;

import com.lowlands.coffee.modules.report.dto.response.ReportResponses.GoodsReceiptReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.GoodsReceiptRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.IngredientConsumptionReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.IngredientConsumptionRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.InventoryReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.InventoryRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.OrderReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.OrderRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentDetailRowResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.PaymentReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueReportResponse;
import com.lowlands.coffee.modules.report.dto.response.ReportResponses.RevenueRowResponse;
import com.lowlands.coffee.modules.report.export.ExcelColumnDefinition;
import com.lowlands.coffee.modules.report.export.ExcelExportService;
import com.lowlands.coffee.modules.report.export.ExcelSheetWriter;
import com.lowlands.coffee.modules.report.export.ExcelStyleHelper;
import com.lowlands.coffee.modules.report.export.ExcelValueType;
import com.lowlands.coffee.modules.report.export.ReportExcelFile;
import com.lowlands.coffee.modules.report.export.ReportExportMetadata;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportExcelExportService implements ExcelExportService {

    private static final DateTimeFormatter FILE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmm");

    @Override
    public ReportExcelFile exportRevenue(RevenueReportResponse report, ReportExportMetadata metadata) {
        return workbook(
                "Revenue_Report",
                "Revenue Report",
                metadata,
                List.of(
                        col("Date", ExcelValueType.DATE, RevenueRowResponse::date),
                        col("Store", ExcelValueType.TEXT, RevenueRowResponse::storeName),
                        col("Revenue", ExcelValueType.CURRENCY, RevenueRowResponse::revenue),
                        col("Completed Orders", ExcelValueType.NUMBER, RevenueRowResponse::completed),
                        col("Cancelled Orders", ExcelValueType.NUMBER, RevenueRowResponse::cancelled),
                        col("Average Order Value", ExcelValueType.CURRENCY, RevenueRowResponse::averageOrderValue),
                        col("Payment Revenue", ExcelValueType.CURRENCY, RevenueRowResponse::revenue)
                ),
                report.rows()
        );
    }

    @Override
    public ReportExcelFile exportOrders(OrderReportResponse report, ReportExportMetadata metadata) {
        return workbook(
                "Orders_Report",
                "Orders Report",
                metadata,
                List.of(
                        col("Order Number", ExcelValueType.TEXT, OrderRowResponse::orderCode),
                        col("Store", ExcelValueType.TEXT, OrderRowResponse::storeName),
                        col("Customer", ExcelValueType.TEXT, OrderRowResponse::customerName),
                        col("Status", ExcelValueType.TEXT, OrderRowResponse::status),
                        col("Payment Status", ExcelValueType.TEXT, OrderRowResponse::paymentStatus),
                        col("Order Total", ExcelValueType.CURRENCY, OrderRowResponse::amount),
                        col("Created At", ExcelValueType.DATETIME, OrderRowResponse::createdAt),
                        col("Completed At", ExcelValueType.DATETIME, OrderRowResponse::completedAt)
                ),
                report.rows()
        );
    }

    @Override
    public ReportExcelFile exportPayments(PaymentReportResponse report, ReportExportMetadata metadata) {
        return workbook(
                "Payment_Report",
                "Payment Report",
                metadata,
                List.of(
                        col("Payment Number", ExcelValueType.TEXT, PaymentDetailRowResponse::paymentNumber),
                        col("Order Number", ExcelValueType.TEXT, PaymentDetailRowResponse::orderCode),
                        col("Store", ExcelValueType.TEXT, PaymentDetailRowResponse::storeName),
                        col("Method", ExcelValueType.TEXT, PaymentDetailRowResponse::paymentMethod),
                        col("Status", ExcelValueType.TEXT, PaymentDetailRowResponse::paymentStatus),
                        col("Amount", ExcelValueType.CURRENCY, PaymentDetailRowResponse::amount),
                        col("Paid Time", ExcelValueType.DATETIME, PaymentDetailRowResponse::paidAt)
                ),
                report.details()
        );
    }

    @Override
    public ReportExcelFile exportInventory(InventoryReportResponse report, ReportExportMetadata metadata) {
        return workbook(
                "Inventory_Report",
                "Inventory Report",
                metadata,
                List.of(
                        col("Ingredient", ExcelValueType.TEXT, InventoryRowResponse::ingredientName),
                        col("Opening", ExcelValueType.NUMBER, InventoryRowResponse::opening),
                        col("IN", ExcelValueType.NUMBER, InventoryRowResponse::inQuantity),
                        col("OUT", ExcelValueType.NUMBER, InventoryRowResponse::outQuantity),
                        col("Adjustment", ExcelValueType.NUMBER, InventoryRowResponse::adjustment),
                        col("Closing", ExcelValueType.NUMBER, InventoryRowResponse::closing),
                        col("Unit", ExcelValueType.TEXT, InventoryRowResponse::unit)
                ),
                report.rows()
        );
    }

    @Override
    public ReportExcelFile exportGoodsReceipts(GoodsReceiptReportResponse report, ReportExportMetadata metadata) {
        return workbook(
                "Goods_Receipt_Report",
                "Goods Receipt Report",
                metadata,
                List.of(
                        col("Receipt Number", ExcelValueType.TEXT, GoodsReceiptRowResponse::receiptCode),
                        col("Supplier", ExcelValueType.TEXT, GoodsReceiptRowResponse::supplierName),
                        col("Store", ExcelValueType.TEXT, GoodsReceiptRowResponse::storeName),
                        col("Created By", ExcelValueType.TEXT, GoodsReceiptRowResponse::createdByName),
                        col("Status", ExcelValueType.TEXT, GoodsReceiptRowResponse::status),
                        col("Total Items", ExcelValueType.NUMBER, GoodsReceiptRowResponse::totalItems),
                        col("Total Cost", ExcelValueType.CURRENCY, GoodsReceiptRowResponse::amount),
                        col("Created Time", ExcelValueType.DATETIME, GoodsReceiptRowResponse::createdAt)
                ),
                report.rows()
        );
    }

    @Override
    public ReportExcelFile exportIngredientConsumption(IngredientConsumptionReportResponse report, ReportExportMetadata metadata) {
        return workbook(
                "Ingredient_Consumption_Report",
                "Ingredient Consumption Report",
                metadata,
                List.of(
                        col("Ingredient", ExcelValueType.TEXT, IngredientConsumptionRowResponse::ingredientName),
                        col("Consumed", ExcelValueType.NUMBER, IngredientConsumptionRowResponse::consumed),
                        col("Current Stock", ExcelValueType.NUMBER, IngredientConsumptionRowResponse::currentStock),
                        col("Unit", ExcelValueType.TEXT, IngredientConsumptionRowResponse::unit)
                ),
                report.rows()
        );
    }

    private <T> ReportExcelFile workbook(
            String filePrefix,
            String sheetName,
            ReportExportMetadata metadata,
            List<ExcelColumnDefinition<T>> columns,
            List<T> rows
    ) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            ExcelStyleHelper styles = new ExcelStyleHelper(workbook);
            new ExcelSheetWriter<T>(workbook, workbook.createSheet(sheetName), styles)
                    .write(metadata, columns, rows);
            workbook.write(output);
            return new ReportExcelFile(
                    filePrefix + "_" + metadata.generatedAt().format(FILE_TIME_FORMAT) + ".xlsx",
                    output.toByteArray()
            );
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot generate report Excel file", exception);
        }
    }

    private <T> ExcelColumnDefinition<T> col(String header, ExcelValueType type, java.util.function.Function<T, Object> extractor) {
        return new ExcelColumnDefinition<>(header, type, extractor);
    }
}
