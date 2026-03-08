import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  pending: "bg-solar-yellow/10 text-solar-yellow border-solar-yellow/20",
  available: "bg-energy-green/10 text-energy-green border-energy-green/20",
  retired: "bg-solar-orange/10 text-solar-orange border-solar-orange/20",
  active: "bg-energy-green/10 text-energy-green border-energy-green/20",
  inactive: "bg-muted text-muted-foreground border-border",
  verified: "bg-energy-green/10 text-energy-green border-energy-green/20",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {status}
    </span>
  )
}
