"use client";

export default function NetworkMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full relative overflow-hidden">
      {children}
    </div>
  );
} 