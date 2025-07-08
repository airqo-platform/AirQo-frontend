"use client";

import Layout from "@/components/layout/layout";
import { ForbiddenGuard } from "@/components/layout/accessConfig/forbidden-guard";
import { useForbiddenHandler } from "@/core/hooks/useForbiddenHandler";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Listen for forbidden events
  useForbiddenHandler();

  return (
    <ForbiddenGuard>
      <Layout>
        {children}
      </Layout>
    </ForbiddenGuard>
  );
}
