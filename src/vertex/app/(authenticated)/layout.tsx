"use client";

import { usePathname } from "next/navigation";
import Layout from "@/components/layout/layout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isNetworkMapRoute = pathname === "/network-map";

  return (
    <Layout 
      hideTopbar={isNetworkMapRoute}
      defaultCollapsed={isNetworkMapRoute}
    >
      {children}
    </Layout>
  );
}
