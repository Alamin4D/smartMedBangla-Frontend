"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminPayments } from "@/features/admin/api";
import { ListToolbar } from "@/features/admin/list-toolbar";
import { fmtDateTime, formatTaka } from "@/lib/format";
import { useT } from "@/hooks/use-t";

const VARIANT = { SUCCESS: "success", PENDING: "warning", FAILED: "destructive", CANCELLED: "secondary" } as const;
const STATUS_BN = { SUCCESS: "সফল", PENDING: "অপেক্ষমাণ", FAILED: "ব্যর্থ", CANCELLED: "বাতিল" } as const;

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const { t, n } = useT();
  const { data, isLoading, error, refetch } = useAdminPayments({ page, search: search || undefined, status: status === "ALL" ? undefined : status });

  return (
    <>
      <PageHeader title={t("Payments", "পেমেন্ট")} description={t("SSLCommerz transactions for Premium subscriptions.", "প্রিমিয়াম সাবস্ক্রিপশনের SSLCommerz লেনদেন।")} />
      <ListToolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder={t("Search transaction ID or email", "লেনদেন আইডি বা ইমেইল দিয়ে খুঁজুন")}
        filters={[
          {
            label: t("Status", "অবস্থা"),
            value: status,
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
            options: [
              { value: "ALL", label: t("All statuses", "সব অবস্থা") },
              { value: "SUCCESS", label: t("Success", "সফল") },
              { value: "PENDING", label: t("Pending", "অপেক্ষমাণ") },
              { value: "FAILED", label: t("Failed", "ব্যর্থ") },
              { value: "CANCELLED", label: t("Cancelled", "বাতিল") },
            ],
          },
        ]}
      />
      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState title={t("No payments found", "কোনো পেমেন্ট পাওয়া যায়নি")} />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">{t("Transaction", "লেনদেন")}</TableHead>
                  <TableHead>{t("User", "ইউজার")}</TableHead>
                  <TableHead>{t("Plan", "প্ল্যান")}</TableHead>
                  <TableHead>{t("Amount", "পরিমাণ")}</TableHead>
                  <TableHead>{t("Status", "অবস্থা")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("Date", "তারিখ")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4 font-mono text-xs">{p.tranId}</TableCell>
                    <TableCell>
                      <p className="font-medium">{p.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                    </TableCell>
                    <TableCell>{t(`${p.months} mo`, `${n(p.months)} মাস`)}</TableCell>
                    <TableCell>{formatTaka(p.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={VARIANT[p.status]}>{t(p.status.toLowerCase(), STATUS_BN[p.status])}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{fmtDateTime(p.createdAt)}</TableCell>
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
