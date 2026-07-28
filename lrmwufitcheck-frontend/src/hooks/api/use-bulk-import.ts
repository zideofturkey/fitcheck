import { useMutation } from "@tanstack/react-query";
import {
  bulkImportService,
  type BulkImportRow,
} from "@/services/api/bulk-import-api";

export const useBulkImport = () => {
  return useMutation({
    mutationFn: (rows: BulkImportRow[]) => bulkImportService.importRows(rows),
  });
};
