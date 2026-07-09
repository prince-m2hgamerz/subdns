"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { DNS_PRESETS, type DnsPreset } from "./types";

export function PresetSelector({
  subdomainName,
  onSelect,
}: {
  subdomainName: string;
  onSelect: (preset: DnsPreset) => void;
}) {
  const [selectedLabel, setSelectedLabel] = useState("");
  const selectedPreset = DNS_PRESETS.find((p) => p.label === selectedLabel);

  const handleChange = (value: string) => {
    setSelectedLabel(value);
    const preset = DNS_PRESETS.find((p) => p.label === value);
    if (!preset) return;
    onSelect({
      ...preset,
      content: preset.content.replace("{subdomain}", subdomainName),
    });
  };

  return (
    <div className="space-y-2">
      <Label>Quick Preset</Label>
      <Select value={selectedLabel} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a platform..." />
        </SelectTrigger>
        <SelectContent>
          {DNS_PRESETS.map((p) => (
            <SelectItem key={p.label} value={p.label}>
              <div className="flex items-center gap-2">
                <span>{p.label}</span>
                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                  {p.type}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedPreset && (
        <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Resolves to: <span className="font-mono text-foreground">{selectedPreset.content.replace("{subdomain}", subdomainName)}</span>
        </div>
      )}
    </div>
  );
}
