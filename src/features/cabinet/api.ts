"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { InventoryItem, StripScanResult } from "@/types";

export type CabinetFilter = "all" | "active" | "expiring" | "expired" | "disposed";

export interface CabinetResponse {
  items: InventoryItem[];
  summary: { total: number; expired: number; expiring: number; ok: number };
}

export interface CabinetInput {
  name: string;
  batchNumber?: string | null;
  manufactureDate?: string | null;
  expiryDate: string;
  quantity?: number | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  notes?: string | null;
  isDisposed?: boolean;
}

export const useCabinet = (status: CabinetFilter, patientId?: string) =>
  useQuery({
    queryKey: ["cabinet", patientId ?? "me", status],
    queryFn: async () => (await api.get<CabinetResponse>("/cabinet", { status, patientId })).data,
  });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["cabinet"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["ai", "usage"] });
  };
}

export function useScanStrip(patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("image", file);
      return api.post<StripScanResult>("/cabinet/scan", form, { patientId });
    },
    onSuccess: invalidate,
  });
}

export function useSaveCabinetItem(patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: Partial<CabinetInput> }) =>
      id ? api.patch<InventoryItem>(`/cabinet/${id}`, input, { patientId }) : api.post<InventoryItem>("/cabinet", input, { patientId }),
    onSuccess: invalidate,
  });
}

export function useDeleteCabinetItem(patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cabinet/${id}`, undefined, { patientId }),
    onSuccess: invalidate,
  });
}
