package com.lowlands.coffee.modules.report.export;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Workbook;

public class ExcelStyleHelper {

    private final Workbook workbook;
    private final CellStyle titleStyle;
    private final CellStyle labelStyle;
    private final CellStyle valueStyle;
    private final CellStyle headerStyle;
    private final CellStyle textStyle;
    private final CellStyle numberStyle;
    private final CellStyle currencyStyle;
    private final CellStyle dateStyle;
    private final CellStyle dateTimeStyle;

    public ExcelStyleHelper(Workbook workbook) {
        this.workbook = workbook;
        this.titleStyle = titleStyle();
        this.labelStyle = labelStyle();
        this.valueStyle = valueStyle();
        this.headerStyle = headerStyle();
        this.textStyle = baseBodyStyle();
        this.numberStyle = numberStyle("#,##0.00");
        this.currencyStyle = numberStyle("#,##0");
        this.dateStyle = numberStyle("yyyy-mm-dd");
        this.dateTimeStyle = numberStyle("yyyy-mm-dd hh:mm");
    }

    public CellStyle titleStyle() {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        return style;
    }

    public CellStyle labelStyle() {
        Font font = workbook.createFont();
        font.setBold(true);
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        return style;
    }

    public CellStyle valueStyle() {
        return baseBodyStyle();
    }

    public CellStyle headerStyle() {
        Font font = workbook.createFont();
        font.setBold(true);
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    public CellStyle text() {
        return textStyle;
    }

    public CellStyle number() {
        return numberStyle;
    }

    public CellStyle currency() {
        return currencyStyle;
    }

    public CellStyle date() {
        return dateStyle;
    }

    public CellStyle dateTime() {
        return dateTimeStyle;
    }

    public CellStyle title() {
        return titleStyle;
    }

    public CellStyle label() {
        return labelStyle;
    }

    public CellStyle value() {
        return valueStyle;
    }

    private CellStyle baseBodyStyle() {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.HAIR);
        return style;
    }

    private CellStyle numberStyle(String pattern) {
        CellStyle style = baseBodyStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat(pattern));
        return style;
    }
}
