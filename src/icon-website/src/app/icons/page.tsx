"use client";
import React, { useState } from "react";
import IconLibraryHeader from "@/components/icons/IconLibraryHeader";
import IconSearchBar from "@/components/icons/IconSearchBar";
import IconGrid from "@/components/icons/IconGrid";
import IconPreviewDialog from "@/components/icons/IconPreviewDialog";
import { useIconSearch } from "@airqo/icons-react";
import type { IconMetadata } from "@airqo/icons-react";

export default function IconLibraryPage() {
  const [query, setQuery] = useState("");
  const [selected, setSel] = useState<IconMetadata | null>(null);
  const [open, setOpen] = useState(false);

  const icons = useIconSearch(query);

  return (
    <>
      <div>
        <IconLibraryHeader />
        <IconSearchBar value={query} onChange={setQuery} />
        <IconGrid
          icons={icons}
          onSelect={(icon) => {
            setSel(icon);
            setOpen(true);
          }}
        />
        <IconPreviewDialog
          icon={selected}
          isOpen={open}
          onClose={() => setOpen(false)}
        />
      </div>
    </>
  );
}
