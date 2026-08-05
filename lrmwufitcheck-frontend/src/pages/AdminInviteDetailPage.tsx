import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useActivateInviteLink,
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
  const { t } = useTranslation();
  const { inviteLinkId } = useParams<{ inviteLinkId: string }>();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { data, isLoading, error } = useGetInviteLink(inviteLinkId);
  const { data: auditsData } = useListInviteAudits(
    inviteLinkId ? { inviteLinkId } : undefined,
  );
  const deliverMutation = useDeliverInviteEmail();
  const revokeMutation = useRevokeInviteLink();
  const activateMutation = useActivateInviteLink();

  const invite = data?.inviteLink;
  const audits = auditsData?.inviteAudits ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        {t("adminInviteDetail.loading")}
      </div>
    );
  }

  if (error || !invite) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t("adminInviteDetail.notFound")}
        </p>
        <Link
          to="/admin/invites"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          {t("adminInviteDetail.allInvites")}
        </Link>
      </Card>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(invite.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const registrationLink = `${window.location.origin}/register?code=${invite.inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRevoke = () => {
    if (!confirm(t("adminInviteDetail.revokeConfirm"))) return;
    revokeMutation.mutate({ inviteLinkId: invite.id, data: {} });
  };

  const handleDeliver = () => deliverMutation.mutate(invite.id);

  const handleActivate = () => activateMutation.mutate(invite.id);

  const isDraft = invite.inviteState === "draft";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              to="/admin/invites"
              className="hover:text-foreground transition-colors"
            >
              {t("adminInviteDetail.invites")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">
              {t("adminInviteDetail.inviteDetail")}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("adminInviteDetail.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adminInviteDetail.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <Button
              onClick={handleActivate}
              disabled={activateMutation.isPending}
            >
              {activateMutation.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {t("adminInviteDetail.activate")}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDeliver}
            disabled={deliverMutation.isPending}
          >
            <Send className="w-4 h-4" />
            {t("adminInviteDetail.sendEmail")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={revokeMutation.isPending}
          >
            <Ban className="w-4 h-4" />
            {t("adminInviteDetail.revoke")}
          </Button>
        </div>
      </div>

      {isDraft && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-accent/50 border border-accent text-sm text-accent-foreground">
          <Zap className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t("adminInviteDetail.draftNotice")}</p>
        </div>
      )}

      <Card className="shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">
                  {t("adminInviteDetail.inviteCode")}
                </h2>
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
              <div className="space-y-1 pt-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("adminInviteDetail.registrationLink")}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted font-mono text-xs max-w-full">
                  <span className="truncate max-w-[220px] sm:max-w-xs">
                    {registrationLink}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={handleCopyLink}
                  >
                    {linkCopied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {invite.usageMode === "singleUse"
                  ? t("adminInviteDetail.singleUse")
                  : t("adminInviteDetail.limitedUse")}{" "}
                · {Math.max(0, (invite.usageLimit ?? 1) - invite.usageCount)}{" "}
                {t("adminInviteDetail.remaining")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              [t("adminInviteDetail.invitedEmail"), invite.invitedEmail ?? "—"],
              [
                t("adminInviteDetail.usage"),
                `${invite.usageCount} / ${invite.usageLimit ?? 1} ${t("adminInviteDetail.used")}`,
              ],
              [t("adminInviteDetail.expires"), formatDateTime(invite.expiresAt)],
              [t("adminInviteDetail.created"), formatDateTime(invite.createdAt)],
              [
                t("adminInviteDetail.lastUsed"),
                formatDateTime(invite.lastUsedAt),
              ],
              [
                t("adminInviteDetail.deliveryRequested"),
                formatDateTime(invite.deliveryRequestedAt),
              ],
              [
                t("adminInviteDetail.lastDelivered"),
                formatDateTime(invite.lastDeliveredAt),
              ],
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
            <h2 className="text-lg font-semibold">
              {t("adminInviteDetail.auditTrail")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("adminInviteDetail.auditSubtitle")}
            </p>
          </div>
        </div>

        {audits.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            {t("adminInviteDetail.noAudits")}
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
