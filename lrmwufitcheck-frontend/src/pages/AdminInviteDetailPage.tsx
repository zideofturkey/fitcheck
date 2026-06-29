import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Ban,
  Check,
  ChevronRight,
  CircleCheck,
  Copy,
  Loader,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useDeliverInviteEmail,
  useGetInviteLink,
  useListInviteAudits,
  useRevokeInviteLink,
} from "@/hooks/api/use-invitationcenter";

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminInviteDetailPage() {
  const { inviteLinkId } = useParams<{ inviteLinkId: string }>();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useGetInviteLink(inviteLinkId);
  const { data: auditsData } = useListInviteAudits(
    inviteLinkId ? { inviteLinkId } : undefined,
  );
  const deliverMutation = useDeliverInviteEmail();
  const revokeMutation = useRevokeInviteLink();

  const invite = data?.inviteLink;
  const audits = auditsData?.inviteAudits ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        Yükleniyor…
      </div>
    );
  }

  if (error || !invite) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Davet bulunamadı.</p>
        <Link
          to="/admin/invites"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Tüm davetler
        </Link>
      </Card>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(invite.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = () => {
    if (!confirm("Revoke this invite link?")) return;
    revokeMutation.mutate({ inviteLinkId: invite.id, data: {} });
  };

  const handleDeliver = () => deliverMutation.mutate(invite.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              to="/admin/invites"
              className="hover:text-foreground transition-colors"
            >
              Invites
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Invite Detail</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Invite Link Detail
          </h1>
          <p className="text-sm text-muted-foreground">
            View invite metadata and audit timeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDeliver}
            disabled={deliverMutation.isPending}
          >
            <Send className="w-4 h-4" />
            Send Email
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={revokeMutation.isPending}
          >
            <Ban className="w-4 h-4" />
            Revoke
          </Button>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Invite Code</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-1" />
                  {invite.inviteState}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted font-mono text-sm">
                <span>{invite.inviteCode}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {invite.usageMode === "singleUse"
                  ? "Single Use"
                  : "Limited Use"}{" "}
                · {Math.max(0, (invite.usageLimit ?? 1) - invite.usageCount)}{" "}
                remaining
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              ["Invited Email", invite.invitedEmail ?? "—"],
              [
                "Usage",
                `${invite.usageCount} / ${invite.usageLimit ?? 1} used`,
              ],
              ["Expires", formatDateTime(invite.expiresAt)],
              ["Created", formatDateTime(invite.createdAt)],
              ["Last Used", formatDateTime(invite.lastUsedAt)],
              [
                "Delivery Requested",
                formatDateTime(invite.deliveryRequestedAt),
              ],
              ["Last Delivered", formatDateTime(invite.lastDeliveredAt)],
            ].map(([label, value]) => (
              <div key={label} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Audit Trail</h2>
            <p className="text-sm text-muted-foreground">
              Chronological log of all events on this invite link.
            </p>
          </div>
        </div>

        {audits.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No audit events recorded.
          </Card>
        ) : (
          <Card className="shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {audits.map((entry, idx) => (
                <div key={entry.id} className="p-4 flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {entry.eventType === "consumed" ? (
                        <CircleCheck className="w-4 h-4 text-chart-2" />
                      ) : entry.eventType === "delivered" ? (
                        <Send className="w-4 h-4 text-chart-1" />
                      ) : entry.eventType === "created" ? (
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <CircleCheck className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {idx < audits.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div
                    className={`flex-1 min-w-0 ${idx < audits.length - 1 ? "pb-4" : ""}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                          {entry.eventType}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(entry.eventAt)}
                      </span>
                    </div>
                    <p className="text-sm">
                      {entry.eventNote ?? entry.eventType}
                    </p>
                    {entry.relatedEmail && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.relatedEmail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
