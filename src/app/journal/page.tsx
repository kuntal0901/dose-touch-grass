"use client";

import Link from "next/link";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { StatsSummary } from "@/components/StatsSummary";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useHydrated } from "@/lib/hooks";
import { useDoseStore } from "@/lib/store";
import { toast } from "sonner";

export default function JournalPage() {
  const hydrated = useHydrated();
  const entries = useDoseStore((s) => s.entries);
  const screenSeconds = useDoseStore((s) => s.screenSeconds);
  const nickname = useDoseStore((s) => s.session?.nickname);
  const resetAll = useDoseStore((s) => s.resetAll);
  const ensureSession = useDoseStore((s) => s.ensureSession);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Your journal</h1>
        <p className="text-sm text-muted-foreground">
          {nickname ? `${nickname}'s` : "Your"} time outside, saved only on this device.
        </p>
      </div>

      <StatsSummary entries={entries} screenSeconds={screenSeconds} />

      {entries.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No challenges yet. Your first one is waiting.</p>
          <Link href="/" className={buttonVariants({ className: "h-11 px-5" })}>
            Find a challenge
          </Link>
        </div>
      ) : (
        <section className="space-y-3">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </section>
      )}

      <div className="pt-4 text-center">
        <Dialog>
          <DialogTrigger render={<Button variant="ghost" size="sm" className="text-muted-foreground" />}>
            Reset session
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start fresh?</DialogTitle>
              <DialogDescription>
                This permanently deletes your journal and gives you a new random nickname. It
                can&apos;t be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <DialogClose
                render={<Button variant="destructive" />}
                onClick={() => {
                  resetAll();
                  ensureSession();
                  toast("Session reset");
                }}
              >
                Delete everything
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
