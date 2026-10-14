"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MealTiming, Medicine } from "@/types";

export const medicineKeys = {
  all: ["medicines"] as const,
  list: (patientId?: string, active?: boolean, search?: string) => ["medicines", patientId ?? "me", active, search] as const,
};

export interface ReminderInput {
  id?: string;
  time: string;
  quantity: string;
  daysOfWeek: number[];
  isActive?: boolean;
}

export interface MedicineInput {
  name: string;
  genericName?: string | null;
  strength?: string | null;
  form?: string | null;
  dosagePattern?: string | null;
  instructions?: string | null;
  instructionsBn?: string | null;
  mealTiming: MealTiming;
  durationDays?: number | null;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
  reminders: ReminderInput[];
}

export const useMedicines = (opts: { patientId?: string; active?: boolean; search?: string } = {}) =>
  useQuery({
    queryKey: medicineKeys.list(opts.patientId, opts.active, opts.search),
    queryFn: async () =>
      (
        await api.get<Medicine[]>("/medicines", {
          patientId: opts.patientId,
          active: opts.active === undefined ? undefined : String(opts.active),
          search: opts.search,
        })
      ).data,
  });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: medicineKeys.all });
    qc.invalidateQueries({ queryKey: ["doses"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["care"] });
  };
}

export function useSaveMedicine(patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: Partial<MedicineInput> }) =>
      id ? api.patch<Medicine>(`/medicines/${id}`, input, { patientId }) : api.post<Medicine>("/medicines", input, { patientId }),
    onSuccess: invalidate,
  });
}

export function useDeleteMedicine(patientId?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/medicines/${id}`, undefined, { patientId }),
    onSuccess: invalidate,
  });
}
