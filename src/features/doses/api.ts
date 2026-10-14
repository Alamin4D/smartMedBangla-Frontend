"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdherenceStats, Dose, PatientDashboard, TodaySchedule } from "@/types";

export const doseKeys = {
  all: ["doses"] as const,
  today: (patientId?: string) => ["doses", "today", patientId ?? "me"] as const,
  history: (patientId: string | undefined, from: string, to: string) => ["doses", "history", patientId ?? "me", from, to] as const,
  stats: (patientId: string | undefined, days: number) => ["doses", "stats", patientId ?? "me", days] as const,
  dashboard: (patientId?: string) => ["dashboard", patientId ?? "me"] as const,
};

export const usePatientDashboard = (patientId?: string) =>
  useQuery({
    queryKey: doseKeys.dashboard(patientId),
    queryFn: async () => (await api.get<PatientDashboard>("/users/dashboard", { patientId })).data,
    refetchInterval: 60_000,
  });

export const useTodayDoses = (patientId?: string) =>
  useQuery({
    queryKey: doseKeys.today(patientId),
    queryFn: async () => (await api.get<TodaySchedule>("/doses/today", { patientId })).data,
    refetchInterval: 60_000,
  });

export const useDoseHistory = (from: string, to: string, patientId?: string) =>
  useQuery({
    queryKey: doseKeys.history(patientId, from, to),
    queryFn: async () => (await api.get<Dose[]>("/doses/history", { patientId, from, to })).data,
  });

export const useDoseStats = (days = 30, patientId?: string) =>
  useQuery({
    queryKey: doseKeys.stats(patientId, days),
    queryFn: async () => (await api.get<AdherenceStats>("/doses/stats", { patientId, days })).data,
  });

export function useUpdateDose(patientId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "TAKEN" | "SKIPPED" | "PENDING" }) =>
      api.patch<Dose>(`/doses/${id}`, { status }, { patientId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: doseKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["care"] });
    },
  });
}
