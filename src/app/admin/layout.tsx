import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageLoader } from "@/components/shared/states";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardShell allow={["ADMIN"]}>{children}</DashboardShell>
    </Suspense>
  );
}
