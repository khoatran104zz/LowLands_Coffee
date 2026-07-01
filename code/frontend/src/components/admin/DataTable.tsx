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
    <div className="flex flex-col w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
      <div className="flex-grow overflow-x-auto">
        <Table>
          <TableHeader className="bg-amber-50/50 dark:bg-amber-950/10">
            <TableRow className="border-b border-zinc-200/85 dark:border-zinc-800">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider py-3.5 px-6 select-none font-outfit">
                  {col.header}
                </TableHead>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableHead className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider text-right py-3.5 px-6 select-none font-outfit">
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
                  className="h-48 text-center text-muted-foreground font-medium text-xs"
                >
                  {t("common.emptyTable")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, idx) => (
                <TableRow 
                  key={item.id || idx}
                  className="hover:bg-amber-50/10 dark:hover:bg-amber-950/5 transition-colors border-b border-zinc-100 dark:border-zinc-800"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3 px-6 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => onView(item)}
                            title={t("common.details")}
                            className="text-zinc-400 hover:text-amber-800 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all h-7 w-7 rounded-md cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => onEdit(item)}
                            title={t("common.edit")}
                            className="text-zinc-400 hover:text-amber-850 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all h-7 w-7 rounded-md cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => onDelete(item)}
                            title={t("common.delete")}
                            className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all h-7 w-7 rounded-md cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
        <div className="flex items-center justify-between border-t border-zinc-200/85 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 px-6 py-3 shrink-0">
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
            {t("common.paginationShowing")}{" "}
            <span className="text-zinc-700 dark:text-zinc-300 font-extrabold">{startIndex + 1}</span>{" "}
            {t("common.paginationTo")}{" "}
            <span className="text-zinc-700 dark:text-zinc-300 font-extrabold">{Math.min(startIndex + pageSize, totalItems)}</span>{" "}
            {t("common.paginationOf")}{" "}
            <span className="text-zinc-700 dark:text-zinc-300 font-extrabold">{totalItems}</span>{" "}
            {t("common.paginationEntries")}
          </div>
          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0 rounded-md cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-bold px-2 text-zinc-700 dark:text-zinc-300 select-none">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0 rounded-md cursor-pointer disabled:opacity-50"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
