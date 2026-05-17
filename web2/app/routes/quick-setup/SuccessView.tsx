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

import { CheckCircle2Icon, ExternalLinkIcon } from "lucide-react"
import i18next from "i18next"
import type { Provider } from "~/backend/ProviderBackend"
import type { Pipe } from "~/backend/PipeBackend"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"

interface SuccessViewProps {
  savedProvider: Provider
  savedPipe: Pipe | null
  onGoToChat: () => void
  onViewProvider: () => void
  onViewPipe: () => void
  onReset: () => void
}

export default function SuccessView({
  savedProvider,
  savedPipe,
  onGoToChat,
  onViewProvider,
  onViewPipe,
  onReset,
}: SuccessViewProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 rounded-2xl mb-6">
        <CheckCircle2Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-base font-semibold text-green-800 dark:text-green-300">
          {i18next.t("setup:Setup complete!")}
        </AlertTitle>
        <AlertDescription className="mt-2 text-green-700 dark:text-green-400">
          <p className="mb-3">
            {i18next.t("setup:Your configuration has been saved. You can now start chatting or further customize your setup.")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onGoToChat}>
              {i18next.t("general:Chat")}
            </Button>
            <Button size="sm" variant="outline" onClick={onViewProvider}>
              <ExternalLinkIcon className="mr-1.5 h-3.5 w-3.5" />
              {i18next.t("setup:View AI Model")}
            </Button>
            {savedPipe && (
              <Button size="sm" variant="outline" onClick={onViewPipe}>
                <ExternalLinkIcon className="mr-1.5 h-3.5 w-3.5" />
                {i18next.t("setup:View Pipe")}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onReset}>
              {i18next.t("setup:Setup another")}
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <div className="rounded-2xl border bg-card p-7">
        <div className="text-[15px] font-semibold mb-3">{i18next.t("setup:Created Resources")}</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {i18next.t("setup:AI Model")}
            </Badge>
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
              {savedProvider.name}
            </code>
            <span className="text-sm text-muted-foreground">
              ({savedProvider.type} / {savedProvider.subType})
            </span>
          </div>
          {savedPipe && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                {i18next.t("general:Pipes")}
              </Badge>
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                {savedPipe.name}
              </code>
              <span className="text-sm text-muted-foreground">({savedPipe.type})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
