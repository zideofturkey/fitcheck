/**
 * Custom service for the admin-only bulk import endpoint (global foodItem/
 * dish/presetMeal records from a JSON `rows` array). Not a Mindbricks
 * Manager - see lrmwufitcheck-nutritionlibrary/src/routes/bulk-import.js.
 */
import { nutritionlibraryApi } from "@/lib/service-client";

export interface BulkImportRow {
  type: "ingredient" | "dish" | "meal_template";
  [key: string]: unknown;
}

export interface BulkImportResult {
  row: number;
  type: string;
  status: "success" | "partial" | "error";
  message?: string;
  createdId?: string;
}

export interface BulkImportSummary {
  total: number;
  success: number;
  partial: number;
  error: number;
}

export interface BulkImportResponse {
  status: string;
  summary: BulkImportSummary;
  results: BulkImportResult[];
}

export const bulkImportService = {
  /** POST /v1/bulk-import */
  importRows: async (rows: BulkImportRow[]): Promise<BulkImportResponse> => {
    return nutritionlibraryApi.post<BulkImportResponse>("v1/bulk-import", {
      rows,
    });
  },
};

export default bulkImportService;
