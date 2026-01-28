import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  variant?: "default" | "compact";
  className?: string;
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionUrl,
  variant = "default",
  className,
}: EmptyStateCardProps) {
  const navigate = useNavigate();

  if (variant === "compact") {
    return (
      <Card className={cn("border-dashed border-2 border-muted", className)}>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <Icon className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <Button size="sm" variant="outline" onClick={() => navigate(actionUrl)}>
            {actionLabel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-dashed border-2 border-muted", className)}>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-10 w-10 text-muted-foreground/60" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
        <Button onClick={() => navigate(actionUrl)}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
