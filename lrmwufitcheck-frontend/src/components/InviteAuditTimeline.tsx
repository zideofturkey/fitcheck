import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvitationcenterInviteAudit {
  id: string;
  eventType: string;
  eventAt: string;
  actorUserId?: string | null;
  eventNote?: string | null;
  relatedEmail?: string | null;
}

interface InviteAuditTimelineProps {
  audits: InvitationcenterInviteAudit[];
  relativeTimeFn?: (date: string) => string;
}

const getEventColor = (eventType: string): string => {
  switch (eventType) {
    case "created":
      return "bg-blue-500";
    case "activated":
      return "bg-green-500";
    case "delivered":
      return "bg-cyan-500";
    case "validated":
      return "bg-yellow-500";
    case "consumed":
      return "bg-teal-500";
    case "revoked":
      return "bg-red-500";
    case "expired":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};

const InviteAuditTimeline: React.FC<InviteAuditTimelineProps> = ({
  audits,
  relativeTimeFn,
}) => {
  if (!audits || audits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ol className="relative border-l border-gray-200 ml-3">
        {audits.map((audit) => {
          const relativeTime = relativeTimeFn
            ? relativeTimeFn(audit.eventAt)
            : audit.eventAt;

          const absoluteTime = new Date(audit.eventAt).toLocaleString();

          return (
            <li key={audit.id} className="mb-4 ml-6">
              <span
                className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white ${getEventColor(audit.eventType)}`}
              />

              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {audit.eventType}
                </Badge>
                <time className="text-sm text-muted-foreground">
                  {relativeTime}
                </time>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help">
                      {absoluteTime}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{audit.eventAt}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <p className="text-sm text-muted-foreground">
                {audit.actorUserId || "System"}
              </p>

              {audit.eventNote && (
                <p className="text-sm italic mt-1">{audit.eventNote}</p>
              )}

              {audit.relatedEmail && (
                <span className="inline-flex mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  {audit.relatedEmail}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default InviteAuditTimeline;
