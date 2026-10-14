"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Payment, PlansResponse } from "@/types";

export const usePlans = () =>
  useQuery({ queryKey: ["billing", "plans"], queryFn: async () => (await api.get<PlansResponse>("/payments/plans")).data });

export const useMyPayments = () =>
  useQuery({ queryKey: ["billing", "payments"], queryFn: async () => (await api.get<Payment[]>("/payments/me")).data });

export const useCheckout = () =>
  useMutation({
    mutationFn: async (months: number) => (await api.post<{ gatewayUrl: string; tranId: string }>("/payments/init", { months })).data,
    onSuccess: (data) => {
      window.location.href = data.gatewayUrl;
    },
  });
