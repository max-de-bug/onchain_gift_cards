"use client";

import { Header } from "@/components/Header";
import { ReactNode } from "react";

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  );
}

