import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "gradient";
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  variant = "default"
}: StatsCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-1",
      variant === "gradient" && "border-brand/20 bg-gradient-to-br from-brand/5 to-accent/5"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-accent/0 group-hover:from-brand/5 group-hover:to-accent/5 transition-all duration-300" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn(
          "p-2 rounded-lg transition-all duration-300",
          variant === "gradient" 
            ? "bg-gradient-to-br from-brand/20 to-accent/20 text-brand group-hover:scale-110" 
            : "bg-muted text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand"
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 font-medium">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

