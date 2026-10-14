"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdherenceInsight, ChatMessage, InteractionReport, MedicineInfo } from "@/types";

export const aiKeys = {
  usage: ["ai", "usage"] as const,
  chat: ["ai", "chat"] as const,
};

export const useAiUsage = () =>
  useQuery({
    queryKey: aiKeys.usage,
    queryFn: async () => (await api.get<{ used: number; limit: number | null; plan: string }>("/ai/usage")).data,
  });

export const useMedicineInfo = () =>
  useMutation({ mutationFn: async (name: string) => (await api.post<MedicineInfo>("/ai/medicine-info", { name })).data });

export const useInteractionCheck = (patientId?: string) =>
  useMutation({
    mutationFn: async (medicines: string[]) => (await api.post<InteractionReport>("/ai/interactions", { medicines }, { patientId })).data,
  });

export const useAdherenceInsight = (patientId?: string) =>
  useMutation({
    mutationFn: async () => (await api.post<AdherenceInsight>("/ai/adherence-insight", {}, { patientId })).data,
  });

export const useChatHistory = () =>
  useQuery({ queryKey: aiKeys.chat, queryFn: async () => (await api.get<ChatMessage[]>("/ai/chat")).data });

export function useSendChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => (await api.post<ChatMessage>("/ai/chat", { message })).data,
    onMutate: async (message) => {
      await qc.cancelQueries({ queryKey: aiKeys.chat });
      const optimistic: ChatMessage = { id: `tmp-${Date.now()}`, role: "USER", content: message, createdAt: new Date().toISOString() };
      qc.setQueryData<ChatMessage[]>(aiKeys.chat, (old = []) => [...old, optimistic]);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: aiKeys.chat }),
  });
}

export function useClearChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete("/ai/chat"),
    onSuccess: () => qc.setQueryData(aiKeys.chat, []),
  });
}
