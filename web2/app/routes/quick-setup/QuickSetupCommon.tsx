// Copyright 2026 The OpenAgent Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { CheckCircle2Icon } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"

interface SelectableCardProps {
  logo?: string
  label: string
  desc: string
  selected: boolean
  onClick: () => void
}

export function SelectableCard({ logo, label, desc, selected, onClick }: SelectableCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-xl border-2 p-3 text-center transition-all select-none",
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/40"
      )}
    >
      {selected && (
        <CheckCircle2Icon className="absolute top-1.5 right-1.5 h-4 w-4 text-primary" />
      )}
      <div className="flex h-11 items-center justify-center mb-2">
        {logo ? (
          <img src={logo} alt={label} className="max-w-[44px] max-h-[44px] object-contain" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-lg font-bold text-muted-foreground">
            {label[0]}
          </div>
        )}
      </div>
      <div className="text-[13px] font-semibold leading-tight mb-0.5">{label}</div>
      <div className="text-[11px] text-muted-foreground leading-tight">{desc}</div>
    </div>
  )
}

interface SectionTitleProps {
  number: number
  title: string
  subtitle?: string
}

export function SectionTitle({ number, title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground">
          {number}
        </div>
        <span className="text-[18px] font-bold">{title}</span>
        {subtitle && (
          <Badge variant="secondary" className="font-normal">
            {subtitle}
          </Badge>
        )}
      </div>
    </div>
  )
}

interface FieldRowProps {
  label: string
  children: React.ReactNode
  hint?: React.ReactNode
}

export function FieldRow({ label, children, hint }: FieldRowProps) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-sm font-medium">{label}</div>
      {children}
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}
