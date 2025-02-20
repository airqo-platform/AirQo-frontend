"use client";

import "../globals.css";
import Layout from "../../components/layout";
import { Toaster } from "@/components/ui/sonner";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout>
      {children}
      <Toaster />
    </Layout>
  );
}
