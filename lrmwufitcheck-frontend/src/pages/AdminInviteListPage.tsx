import { useState } from "react";
import { Link } from "react-router-dom";
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

function getStatusBadge(state: InviteState) {
  switch (state) {
    case "active":
      return {
        className: "bg-secondary text-secondary-foreground",
        dotClass: "bg-chart-1",
        label: "Active",
      };
    case "draft":
      return {
        className: "bg-muted text-muted-foreground",
        dotClass: "bg-foreground/30",
        label: "Draft",
      };
    case "expired":
      return {
        className: "bg-chart-4/15 text-chart-4",
        dotClass: "bg-chart-4",
        label: "Expired",
      };
    case "consumed":
      return {
        className: "bg-chart-1/15 text-chart-1",
        dotClass: "bg-chart-1",
        label: "Consumed",
      };
    case "revoked":
      return {
        className: "bg-destructive/10 text-destructive",
        dotClass: "bg-destructive",
        label: "Revoked",
      };
    case "exhausted":
      return {
        className: "bg-muted text-muted-foreground",
        dotClass: "bg-foreground/40",
        label: "Exhausted",
      };
    default:
      return {
        className: "bg-muted text-muted-foreground",
        dotClass: "bg-foreground/30",
        label: state,
      };
  }
}

function formatDate(iso?: string) {
  if (!iso) return "No expiry";
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
  const [stateFilter, setStateFilter] = useState<string>("");
  const [modeFilter, setModeFilter] = useState<string>("");
  const [page, setPage] = useState(1);

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
    if (!confirm("Revoke this invite link?")) return;
    revokeMutation.mutate({ inviteLinkId: id, data: {} });
  };
  const handleDeliver = (id: string) => deliverMutation.mutate(id);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Invite Links
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage invitation links for onboarding new users.
          </p>
        </div>
        <Link
          to="/admin/invites/create"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Create Invite
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
            aria-label="Filter by state"
          >
            <option value="">All States</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
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
            aria-label="Filter by usage mode"
          >
            <option value="">All Modes</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m === "singleUse" ? "Single Use" : "Limited Use"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && invites.length === 0 && (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          Yükleniyor…
        </Card>
      )}

      {!isLoading && invites.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No invite links found.
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  Email
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  Code
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  State
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  Usage
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  Expires
                </th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground">
                  Created
                </th>
                <th className="text-end px-4 py-3 font-semibold text-muted-foreground">
                  Actions
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
                            Open invite
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {invite.usageMode === "singleUse"
                            ? "Single Use"
                            : "Limited Use"}
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
                      {formatDate(invite.expiresAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(invite.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/invites/${invite.id}`}
                          className="p-2 rounded-md hover:bg-accent transition-colors"
                          aria-label="View details"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        {invite.inviteState === "active" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeliver(invite.id)}
                              className="p-2 rounded-md hover:bg-accent transition-colors"
                              aria-label="Send email"
                            >
                              <Mail className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevoke(invite.id)}
                              className="p-2 rounded-md hover:bg-accent transition-colors"
                              aria-label="Revoke"
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
                            aria-label="Activate"
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
            Page {page} of {totalPages} · {totalCount} total
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              disabled={page <= 1}
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              disabled={page >= totalPages}
              aria-label="Next page"
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
                      Open invite
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {invite.usageMode === "singleUse"
                      ? "Single Use"
                      : "Limited Use"}
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
                  <span className="text-muted-foreground">Usage</span>
                  <p className="font-medium">
                    {invite.usageCount} / {invite.usageLimit ?? 1}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires</span>
                  <p
                    className={`font-medium ${invite.inviteState === "expired" ? "text-destructive" : ""}`}
                  >
                    {formatDate(invite.expiresAt)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="font-medium">{formatDate(invite.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 pt-1 border-t border-border">
                <Link
                  to={`/admin/invites/${invite.id}`}
                  className="flex-1 p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium min-h-[44px]"
                  aria-label="View details"
                >
                  <Eye className="w-4 h-4" /> View
                </Link>
                {invite.inviteState === "active" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDeliver(invite.id)}
                      className="flex-1 p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium min-h-[44px]"
                      aria-label="Send email"
                    >
                      <Mail className="w-4 h-4" /> Send
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(invite.id)}
                      className="flex-1 p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium min-h-[44px]"
                      aria-label="Revoke"
                    >
                      <Ban className="w-4 h-4" /> Revoke
                    </button>
                  </>
                )}
                {invite.inviteState === "draft" && (
                  <button
                    type="button"
                    onClick={() => handleActivate(invite.id)}
                    className="flex-1 p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium min-h-[44px] text-chart-1"
                    aria-label="Activate"
                  >
                    <Play className="w-4 h-4" /> Activate
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
