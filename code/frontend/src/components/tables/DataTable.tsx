import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchQuery?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  pageSize?: number;
}

export function DataTable<T extends { id?: number | string }>({
  data,
  columns,
  searchKey,
  searchQuery = "",
  onEdit,
  onDelete,
  onView,
  pageSize = 7
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = data.filter((item) => {
    if (!searchQuery || !searchKey) return true;
    const value = item[searchKey];
    if (value === undefined || value === null) return false;
    return String(value).toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex flex-col w-full h-full bg-card rounded-xl border border-border/80 shadow-xs overflow-hidden">
      <div className="flex-grow overflow-x-auto min-h-[300px]">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-4 px-6 select-none font-outfit">
                  {col.header}
                </TableHead>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-right py-4 px-6 select-none font-outfit">
                  {t("common.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + ((onEdit || onDelete || onView) ? 1 : 0)}
                  className="h-48 text-center text-muted-foreground font-medium"
                >
                  {t("common.emptyTable")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, idx) => (
                <TableRow 
                  key={item.id || idx}
                  className="hover:bg-muted/10 transition-colors border-b border-border/40"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-4 px-6 text-sm text-foreground/90 font-medium">
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onView(item)}
                             title={t("common.details")}
                             className="text-muted-foreground hover:text-primary transition-colors h-8 w-8 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEdit(item)}
                             title={t("common.edit")}
                             className="text-muted-foreground hover:text-amber-600 transition-colors h-8 w-8 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(item)}
                             title={t("common.delete")}
                             className="text-muted-foreground hover:text-rose-600 transition-colors h-8 w-8 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-6 py-3">
          <div className="text-xs text-muted-foreground font-medium">
            {t.rich("common.pagination", {
              start: startIndex + 1,
              end: Math.min(startIndex + pageSize, totalItems),
              total: totalItems,
              bold: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>
            })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-semibold px-2 text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
