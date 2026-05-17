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

import { ExternalLinkIcon } from "lucide-react"
import i18next from "i18next"
import {
  getPipePlatformMetadata,
  getPipeTypeOptions,
  getProviderLogoURL,
} from "~/lib/ProviderSetting"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"
import { FieldRow, SectionTitle, SelectableCard } from "./QuickSetupCommon"

interface PipeSectionProps {
  selectedPipeType: string | null
  pipeSkipped: boolean
  onSelectPipe: (type: string) => void
  onSkipPipe: () => void
  pipeToken: string
  setPipeToken: (v: string) => void
}

export default function PipeSection({
  selectedPipeType,
  pipeSkipped,
  onSelectPipe,
  onSkipPipe,
  pipeToken,
  setPipeToken,
}: PipeSectionProps) {
  const pipeTypes = getPipeTypeOptions()
  const meta = selectedPipeType ? getPipePlatformMetadata(selectedPipeType) : null

  return (
    <div className="rounded-2xl border bg-card p-7 mb-6">
      <SectionTitle
        number={2}
        title={i18next.t("setup:Connect a Messaging Platform")}
        subtitle={i18next.t("setup:Optional")}
      />
      <p className="text-sm text-muted-foreground mb-4">
        {i18next.t("setup:Connect a messaging app so users can chat with your AI through Telegram, Discord, or WhatsApp. You can skip this step and set it up later.")}
      </p>

      <div
        className="grid gap-3 mb-6"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
      >
        {pipeTypes.map((p: { id: string; name: string }) => (
          <SelectableCard
            key={p.id}
            logo={getProviderLogoURL({ category: "Chat", type: p.id })}
            label={p.name}
            desc={getPipePlatformMetadata(p.id).desc}
            selected={selectedPipeType === p.id}
            onClick={() => onSelectPipe(p.id)}
          />
        ))}

        {/* Skip card */}
        <div
          onClick={onSkipPipe}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition-all select-none",
            pipeSkipped
              ? "border-border bg-muted/60"
              : "border-border bg-card hover:border-primary/40 hover:bg-accent/40"
          )}
        >
          <div className="text-[28px] mb-2 opacity-40">✕</div>
          <div className="text-[13px] font-semibold mb-0.5">{i18next.t("setup:Skip")}</div>
          <div className="text-[11px] text-muted-foreground">{i18next.t("setup:Set up later")}</div>
        </div>
      </div>

      {meta && !pipeSkipped && (
        <div className="border-t pt-5 mt-1">
          <div className="text-[15px] font-semibold mb-4">
            {i18next.t("setup:Configure")} {selectedPipeType}
          </div>

          <FieldRow
            label={meta.tokenLabel}
            hint={
              <span>
                {i18next.t("setup:How to get a token?")}&nbsp;
                <a
                  href={meta.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {i18next.t("setup:View guide")}
                  <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </span>
            }
          >
            <Input
              type="password"
              value={pipeToken}
              onChange={(e) => setPipeToken(e.target.value)}
              placeholder={meta.tokenPlaceholder}
              className="h-10"
            />
          </FieldRow>
        </div>
      )}
    </div>
  )
}
