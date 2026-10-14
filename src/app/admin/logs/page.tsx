"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAiLogs, useAdminAuditLogs } from "@/features/admin/api";
import { ListToolbar } from "@/features/admin/list-toolbar";
import { fmtDateTime } from "@/lib/format";
import { useT } from "@/hooks/use-t";

function AiLogs() {
  const [page, setPage] = useState(1);
  const { t } = useT();
  const [feature, setFeature] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const { data, isLoading, error, refetch } = useAdminAiLogs({
    page,
    feature: feature === "ALL" ? undefined : feature,
    status: status === "ALL" ? undefined : status,
  });

  return (
    <>
      <ListToolbar
        filters={[
          {
            label: t("Feature", "ফিচার"),
            value: feature,
            onChange: (v) => {
              setFeature(v);
              setPage(1);
            },
            options: [
              { value: "ALL", label: t("All features", "সব ফিচার") },
              { value: "PRESCRIPTION_OCR", label: t("Prescription OCR", "প্রেসক্রিপশন পড়া") },
              { value: "EXPIRY_SCAN", label: t("Expiry scan", "মেয়াদ স্ক্যান") },
              { value: "MEDICINE_INFO", label: t("Medicine info", "ওষুধ পরিচিতি") },
              { value: "INTERACTION_CHECK", label: t("Interactions", "প্রতিক্রিয়া যাচাই") },
              { value: "HEALTH_CHAT", label: t("Chat", "চ্যাট") },
              { value: "ADHERENCE_INSIGHT", label: t("Insights", "রিপোর্ট") },
            ],
          },
          {
            label: t("Result", "ফলাফল"),
            value: status,
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
            options: [
              { value: "ALL", label: t("Any result", "সব ফলাফল") },
              { value: "success", label: t("Succeeded", "সফল") },
              { value: "failed", label: t("Failed", "ব্যর্থ") },
            ],
          },
        ]}
      />
      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState title={t("No AI calls recorded", "কোনো এআই ব্যবহার নেই")} />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">{t("When", "সময়")}</TableHead>
                  <TableHead>{t("Feature", "ফিচার")}</TableHead>
                  <TableHead>{t("User", "ইউজার")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("Provider", "প্রোভাইডার")}</TableHead>
                  <TableHead>{t("Latency", "সময় লেগেছে")}</TableHead>
                  <TableHead>{t("Result", "ফলাফল")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="pl-4 text-xs">{fmtDateTime(l.createdAt)}</TableCell>
                    <TableCell>{l.feature.replace(/_/g, " ").toLowerCase()}</TableCell>
                    <TableCell className="max-w-40 truncate text-xs">{l.user.email}</TableCell>
                    <TableCell className="hidden font-mono text-xs md:table-cell">{l.provider}</TableCell>
                    <TableCell className="tabular-nums">{l.latencyMs != null ? `${(l.latencyMs / 1000).toFixed(1)}s` : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={l.success ? "success" : "destructive"} title={l.error ?? undefined}>
                        {l.success ? t("ok", "সফল") : t("failed", "ব্যর্থ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Pagination page={page} totalPages={data?.meta?.totalPages ?? 1} onChange={setPage} />
    </>
  );
}

function AuditLogs() {
  const [page, setPage] = useState(1);
  const { t } = useT();
  const { data, isLoading, error, refetch } = useAdminAuditLogs({ page });

  if (isLoading) return <ListSkeleton />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data?.items.length) return <EmptyState title={t("No admin actions yet", "এখনো কোনো অ্যাডমিন কার্যক্রম নেই")} />;

  return (
    <>
      <ul className="divide-y rounded-2xl border bg-card">
        {data.items.map((log) => (
          <li key={log.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-44 shrink-0 text-xs text-muted-foreground">{fmtDateTime(log.createdAt)}</span>
            <Badge variant="secondary" className="w-fit font-mono">
              {log.action}
            </Badge>
            <span className="text-sm">
              {t("by", "করেছেন")} <strong>{log.actor?.name ?? t("system", "সিস্টেম")}</strong>
              {log.targetType && (
                <span className="text-muted-foreground">
                  {" "}
                  {t("on", "·")} {log.targetType} {log.targetId?.slice(-8)}
                </span>
              )}
            </span>
            {log.meta && <code className="truncate text-xs text-muted-foreground sm:ml-auto sm:max-w-72">{JSON.stringify(log.meta)}</code>}
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} />
    </>
  );
}

export default function AdminLogsPage() {
  const { t } = useT();
  return (
    <>
      <PageHeader title={t("Logs", "লগ")} description={t("AI usage monitoring and an audit trail of admin actions.", "এআই ব্যবহার পর্যবেক্ষণ ও অ্যাডমিন কার্যক্রমের রেকর্ড।")} />
      <Tabs defaultValue="ai">
        <TabsList className="mb-4">
          <TabsTrigger value="ai">{t("AI usage", "এআই ব্যবহার")}</TabsTrigger>
          <TabsTrigger value="audit">{t("Audit trail", "অডিট লগ")}</TabsTrigger>
        </TabsList>
        <TabsContent value="ai">
          <AiLogs />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>
      </Tabs>
    </>
  );
}
