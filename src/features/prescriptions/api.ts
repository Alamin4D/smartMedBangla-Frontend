"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Prescription, PrescriptionStatus } from "@/types";
import type { MedicineInput } from "@/features/medicines/api";

export const prescriptionKeys = {
  all: ["prescriptions"] as const,
  list: (p: { patientId?: string; page: number; search?: string; status?: PrescriptionStatus }) => ["prescriptions", "list", p] as const,
  detail: (id: string) => ["prescriptions", "detail", id] as const,
};

export const usePrescriptions = (params: { patientId?: string; page: number; search?: string; status?: PrescriptionStatus }) =>
  useQuery({
    queryKey: prescriptionKeys.list(params),
    queryFn: async () => {
      const res = await api.get<Prescription[]>("/prescriptions", { ...params, limit: 12 });
      return { items: res.data, meta: res.meta };
    },
    placeholderData: (prev) => prev,
  });

export const usePrescription = (id: string, patientId?: string) =>
  useQuery({
    queryKey: prescriptionKeys.detail(id),
    queryFn: async () => (await api.get<Prescription>(`/prescriptions/${id}`, { patientId })).data,
    // Keep polling while the AI is still reading the prescription.
    refetchInterval: (q) => (q.state.data?.status === "PROCESSING" ? 3000 : false),
  });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: prescriptionKeys.all });
    qc.invalidateQueries({ queryKey: ["medicines"] });
    qc.invalidateQueries({ queryKey: ["doses"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["ai", "usage"] });
  };
}

export function useUploadPrescription(patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) => {
      const form = new FormData();
      form.append("image", file);
      if (title) form.append("title", title);
      return api.post<Prescription>("/prescriptions", form, { patientId });
    },
    onSuccess: invalidate,
  });
}

export interface PrescriptionMetaInput {
  title?: string | null;
  doctorName?: string | null;
  hospital?: string | null;
  prescribedDate?: string | null;
  diagnosis?: string | null;
  advice?: string | null;
  notes?: string | null;
}

export function useUpdatePrescription(id: string, patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: PrescriptionMetaInput) => api.patch<Prescription>(`/prescriptions/${id}`, input, { patientId }),
    onSuccess: invalidate,
  });
}

export function useConfirmPrescription(id: string, patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: PrescriptionMetaInput & { medicines: MedicineInput[] }) =>
      api.post<Prescription>(`/prescriptions/${id}/confirm`, input, { patientId }),
    onSuccess: invalidate,
  });
}

export function useReprocessPrescription(id: string, patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => api.post<Prescription>(`/prescriptions/${id}/reprocess`, undefined, { patientId }),
    onSuccess: invalidate,
  });
}

export function useDeletePrescription(patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/prescriptions/${id}`, undefined, { patientId }),
    onSuccess: invalidate,
  });
}
