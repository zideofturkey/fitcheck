import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Layers,
  Loader,
  Mail,
  Play,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useActivateInviteLink,
  useDeliverInviteEmail,
  useListInviteLinks,
  useRevokeInviteLink,
} from "@/hooks/api/use-invitationcenter";
import type { InvitationcenterInviteLink } from "@/types/api";

type InviteLink = InvitationcenterInviteLink;
type InviteState = InviteLink["inviteState"];

const STATES: InviteState[] = [
  "draft",
  "active",
  "exhausted",
  "revoked",
  "expired",
  "consumed",
];

const MODES: InviteLink["usageMode"][] = ["singleUse", "limitedUse"];

function formatDate(iso: string | undefined, t: (key: string) => string) {
  if (!iso) return t("adminInvites.noExpiry");
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminInviteListPage() {
  const { t } = useTranslation();
  const [stateFilter, setStateFilter] = useState<string>("");
  const [modeFilter, setModeFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const STATE_LABEL: Record<InviteState, string> = {
    active: t("adminInvites.stateActive"),
    draft: t("adminInvites.stateDraft"),
    expired: t("adminInvites.stateExpired"),
    consumed: t("adminInvites.stateConsumed"),
    revoked: t("adminInvites.stateRevoked"),
    exhausted: t("adminInvites.stateExhausted"),
  };

  function getStatusBadge(state: InviteState) {
    switch (state) {
      case "active":
        return {
          className: "bg-secondary text-secondary-foreground",
          dotClass: "bg-chart-1",
          label: STATE_LABEL.active,
        };
      case "draft":
        return {
          className: "bg-muted text-muted-foreground",
          dotClass: "bg-foreground/30",
          label: STATE_LABEL.draft,
        };
      case "expired":
        return {
          className: "bg-chart-4/15 text-chart-4",
          dotClass: "bg-chart-4",
          label: STATE_LABEL.expired,
        };
      case "consumed":
        return {
          className: "bg-chart-1/15 text-chart-1",
          dotClass: "bg-chart-1",
          label: STATE_LABEL.consumed,
        };
      case "revoked":
        return {
          className: "bg-destructive/10 text-destructive",
          dotClass: "bg-destructive",
          label: STATE_LABEL.revoked,
        };
      case "exhausted":
        return {
          className: "bg-muted text-muted-foreground",
          dotClass: "bg-foreground/40",
          label: STATE_LABEL.exhausted,
        };
      default:
        return {
          className: "bg-muted text-muted-foreground",
          dotClass: "bg-foreground/30",
          label: state,
        };
    }
  }

  const params = {
    inviteState: (stateFilter || undefined) as InviteState | undefined,
    usageMode: (modeFilter || undefined) as InviteLink["usageMode"] | undefined,
    pageNumber: page,
    pageRowCount: 10,
  };
  const { data, isLoading } = useListInviteLinks(params);

  const activateMutation = useActivateInviteLink();
  const revokeMutation = useRevokeInviteLink();
  const deliverMutation = useDeliverInviteEmail();

  const invites = data?.inviteLinks ?? [];
  const totalCount = data?.rowCount ?? invites.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  const handleActivate = (id: string) => activateMutation.mutate(id);
  const handleRevoke = (id: string) => {
    if (!confirm(t("adminInvites.revokeConfirm"))) return;
    revokeMutation.mutate({ inviteLinkId: id, data: {} });
  };
  const handleDeliver = (id: string) => deliverMutation.mutate(id);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("adminInvites.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adminInvites.subtitle")}
          </p>
        </div>
        <Link
          to="/admin/invites/create"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          {t("adminInvites.createInvite")}
        </Link>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:max-w-[180px] rounded-md border border-input bg-background text-sm px-3 py-2 min-h-[44px] text-foreground"
            aria-label={t("adminInvites.filterByState")}
          >
            <option value="">{t("adminInvites.allStates")}</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {STATE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:max-w-[180px] rounded-md border border-input bg-background text-sm px-3 py-2 min-h-[44px] text-foreground"
            aria-label={t("adminInvites.filterByMode")}
          >
            <option value="">{t("adminInvites.allModes")}</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m === "singleUse"
                  ? t("adminInvites.singleUse")
                  : t("adminInvites.limitedUse")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && invites.length === 0 && (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          {t("adminInvites.loading")}
        </Card>
      )}

      {!isLoading && invites.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {t("adminInvites.noInvites")}
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  {t("adminInvites.colEmail")}
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  {t("adminInvites.colCode")}
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  {t("adminInvites.colState")}
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  {t("adminInvites.colUsage")}
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  {t("adminInvites.colExpires")}
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  {t("adminInvites.colCreated")}
                </th>
                <th className="text-end px-4 py-3 font-semibold text-muted-foreground">
                  {t("adminInvites.colActions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invites.map((invite) => {
                const badge = getStatusBadge(invite.inviteState);
                return (
                  <tr
                    key={invite.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        {invite.invitedEmail ? (
                          <span className="font-medium">
                            {invite.invitedEmail}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">
                            {t("adminInvites.openInvite")}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {invite.usageMode === "singleUse"
                            ? t("adminInvites.singleUse")
                            : t("adminInvites.limitedUse")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md select-all">
                        {invite.inviteCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`}
                        />
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">
                        {invite.usageCount} / {invite.usageLimit ?? 1}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 ${invite.inviteState === "expired" ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {formatDate(invite.expiresAt, t)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(invite.createdAt, t)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/invites/${invite.id}`}
                          className="p-2 rounded-md hover:bg-accent transition-colors"
                          aria-label={t("adminInvites.viewDetails")}
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        {invite.inviteState === "active" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeliver(invite.id)}
                              className="p-2 rounded-md hover:bg-accent transition-colors"
                              aria-label={t("adminInvites.sendEmail")}
                            >
                              <Mail className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevoke(invite.id)}
                              className="p-2 rounded-md hover:bg-accent transition-colors"
                              aria-label={t("adminInvites.revoke")}
                            >
                              <Ban className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </>
                        )}
                        {invite.inviteState === "draft" && (
                          <button
                            type="button"
                            onClick={() => handleActivate(invite.id)}
                            className="p-2 rounded-md hover:bg-accent transition-colors"
                            aria-label={t("adminInvites.activate")}
                          >
                            <Play className="w-4 h-4 text-chart-1" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t("adminInvites.pageOf", { page, totalPages })} · {totalCount}{" "}
            {t("adminInvites.total")}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              disabled={page <= 1}
              aria-label={t("adminInvites.previousPage")}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              disabled={page >= totalPages}
              aria-label={t("adminInvites.nextPage")}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {invites.map((invite) => {
          const badge = getStatusBadge(invite.inviteState);
          return (
            <Card key={invite.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {invite.invitedEmail ? (
                    <p className="font-semibold text-sm truncate">
                      {invite.invitedEmail}
                    </p>
                  ) : (
                    <p className="font-semibold text-sm text-muted-foreground italic">
                      {t("adminInvites.openInvite")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {invite.usageMode === "singleUse"
                      ? t("adminInvites.singleUse")
                      : t("adminInvites.limitedUse")}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${badge.className}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`}
                  />
                  {badge.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono bg-muted px-2 py-1 rounded-md select-all text-xs">
                  {invite.inviteCode}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">
                    {t("adminInvites.colUsage")}
                  </span>
                  <p className="font-medium">
                    {invite.usageCount} / {invite.usageLimit ?? 1}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("adminInvites.colExpires")}
                  </span>
                  <p
                    className={`font-medium ${invite.inviteState === "expired" ? "text-destructive" : ""}`}
                  >
                    {formatDate(invite.expiresAt, t)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("adminInvites.colCreated")}
                  </span>
                  <p className="font-medium">
                    {formatDate(invite.createdAt, t)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 pt-1 border-t border-border">
                <Link
                  to={`/admin/invites/${invite.id}`}
                  className="flex-1 p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium min-h-[44px]"
                  aria-label={t("adminInvites.viewDetails")}
                >
                  <Eye className="w-4 h-4" /> {t("adminInvites.view")}
                </Link>
                {invite.inviteState === "active" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDeliver(invite.id)}
                      className="flex-1 p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium min-h-[44px]"
                      aria-label={t("adminInvites.sendEmail")}
                    >
                      <Mail className="w-4 h-4" /> {t("adminInvites.send")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(invite.id)}
                      className="flex-1 p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium min-h-[44px]"
                      aria-label={t("adminInvites.revoke")}
                    >
                      <Ban className="w-4 h-4" /> {t("adminInvites.revoke")}
                    </button>
                  </>
                )}
                {invite.inviteState === "draft" && (
                  <button
                    type="button"
                    onClick={() => handleActivate(invite.id)}
                    className="flex-1 p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium min-h-[44px] text-chart-1"
                    aria-label={t("adminInvites.activate")}
                  >
                    <Play className="w-4 h-4" /> {t("adminInvites.activate")}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
