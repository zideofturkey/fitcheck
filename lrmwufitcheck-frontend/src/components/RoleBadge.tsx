import * as React from "react";
import { Badge } from "@/components/ui/badge";

export const ROLE_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  superAdmin: { label: "Super Admin", variant: "destructive" },
  admin: { label: "Admin", variant: "default" },
  user: { label: "User", variant: "secondary" },
};

interface RoleBadgeProps {
  roleId: string | null | undefined;
  className?: string;
}

function getRoleConfig(roleId: string | null | undefined) {
  if (!roleId) return { label: "Unknown", variant: "outline" as const };
  return ROLE_CONFIG[roleId] ?? { label: roleId, variant: "outline" as const };
}

export default function RoleBadge({ roleId, className }: RoleBadgeProps) {
  const { label, variant } = getRoleConfig(roleId);

  return (
    <Badge variant={variant} className={`text-xs ${className ?? ""}`}>
      {label}
    </Badge>
  );
}
