import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageLoader } from "@/components/shared/states";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
