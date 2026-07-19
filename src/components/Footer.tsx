export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} PromptForge AI. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-xs text-muted transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="text-xs text-muted transition-colors hover:text-foreground">
            Terms
          </a>
          <a href="#" className="text-xs text-muted transition-colors hover:text-foreground">
            Status
          </a>
        </div>
      </div>
    </footer>
  );
}
