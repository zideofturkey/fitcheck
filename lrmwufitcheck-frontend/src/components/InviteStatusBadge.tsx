import * as React from "react";

interface InviteStatusBadgeProps {
  state: "draft" | "active" | "exhausted" | "revoked" | "expired" | "consumed";
  label?: string;
}

const stateLabelMap: Record<InviteStatusBadgeProps["state"], string> = {
  draft: "Draft",
  active: "Active",
  exhausted: "Exhausted",
  revoked: "Revoked",
  expired: "Expired",
  consumed: "Consumed",
};

const stateColorMap: Record<InviteStatusBadgeProps["state"], string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  exhausted: "bg-orange-100 text-orange-700",
  revoked: "bg-red-100 text-red-700",
  expired: "bg-purple-100 text-purple-700",
  consumed: "bg-teal-100 text-teal-700",
};

const InviteStatusBadge: React.FC<InviteStatusBadgeProps> = ({
  state,
  label,
}) => {
  const displayLabel = label ?? stateLabelMap[state];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        stateColorMap[state] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {displayLabel}
    </span>
  );
};

export default InviteStatusBadge;
