export function AppFooter() {
  return (
    <footer className="flex h-[52px] shrink-0 items-center justify-center border-t border-border px-4 text-xs text-muted-foreground">
      <span>
        Powered by{" "}
        <a
          href="https://github.com/OpenAgentPlatform/openagent"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          OpenAgent
        </a>
      </span>
    </footer>
  )
}
