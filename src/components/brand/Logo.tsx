import { ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {/* Emblem with Indian Ashoka motif and shield */}
      <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-midnight via-primary to-transport border border-accent/30 shadow-md">
        <span className="chakra-motif absolute inset-0 opacity-30" />
        <ShieldCheck className="relative size-5 text-accent" />
        <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-midnight border border-saffron shadow">
          <Truck className="size-2.5 text-saffron" />
        </span>
      </div>

      {!compact && (
        <div className="flex flex-col min-w-0">
          <span className="font-display text-lg font-bold tracking-tight text-foreground leading-tight">
            ANUSHRAWAN
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-semibold text-saffron leading-none">अनुश्रवण</span>
            <span className="text-[10px] text-muted-foreground/60 leading-none">·</span>
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase leading-none">
              Bharat Fleet
            </span>
            <span className="h-1 w-3.5 rounded-full bg-gradient-to-r from-saffron via-white to-india-green" />
          </div>
        </div>
      )}
    </div>
  );
}
