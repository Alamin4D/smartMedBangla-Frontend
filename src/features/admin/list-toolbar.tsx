"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ListToolbar({
  search,
  onSearch,
  placeholder,
  filters = [],
}: {
  search?: string;
  onSearch?: (v: string) => void;
  placeholder?: string;
  filters?: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }[];
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      {onSearch && (
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className="pl-9" aria-label={placeholder} />
        </div>
      )}
      {filters.map((f) => (
        <Select key={f.label} value={f.value} onValueChange={f.onChange}>
          <SelectTrigger className="w-full sm:w-44" aria-label={f.label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {f.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
