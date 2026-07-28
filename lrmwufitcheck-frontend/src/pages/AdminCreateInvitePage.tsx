import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  ChevronRight,
  Clock,
  Hash,
  Mail,
  Sparkles,
  Tag,
  Target,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useCreateInviteLink } from "@/hooks/api/use-invitationcenter";

type UsageMode = "singleUse" | "limitedUse";

export default function AdminCreateInvitePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateInviteLink();
  const [invitedEmail, setInvitedEmail] = useState("");
  const [usageMode, setUsageMode] = useState<UsageMode>("singleUse");
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        invitedEmail: invitedEmail || undefined,
        usageMode,
        usageLimit:
          usageMode === "limitedUse" && usageLimit !== ""
            ? Number(usageLimit)
            : undefined,
        expiresAt: expiresAt || undefined,
      },
      {
        onSuccess: () => navigate("/admin/invites"),
      },
    );
  };

  const summaryMode =
    usageMode === "singleUse"
      ? t("adminCreateInvite.singleUse")
      : t("adminCreateInvite.limitedUse");
  const summaryExpires = expiresAt
    ? new Date(expiresAt).toLocaleDateString()
    : t("adminCreateInvite.never");
  const summaryLimit =
    usageMode === "limitedUse" && usageLimit
      ? `${usageLimit} ${t("adminCreateInvite.usesLabel")}`
      : t("adminCreateInvite.notApplicable");
  void summaryLimit;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-20 md:py-8">
      {/* Page Header */}
      <header className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link
            to="/admin/invites"
            className="hover:text-foreground transition-colors"
          >
            {t("adminCreateInvite.invites")}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">
            {t("adminCreateInvite.createInvite")}
          </span>
        </nav>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("adminCreateInvite.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adminCreateInvite.subtitle")}
          </p>
        </div>
      </header>

      {/* Decorative gradient blob */}
      <div className="relative mb-8">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Invited Email */}
          <div className="space-y-2">
            <label
              htmlFor="invitedEmail"
              className="text-sm font-semibold block"
            >
              {t("adminCreateInvite.invitedEmail")}{" "}
              <span className="text-muted-foreground font-normal">
                {t("adminCreateInvite.optional")}
              </span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                id="invitedEmail"
                placeholder="user@email.com"
                value={invitedEmail}
                onChange={(e) => setInvitedEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminCreateInvite.emailHint")}
            </p>
          </div>

          {/* Usage Mode */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">
              {t("adminCreateInvite.usageMode")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted transition-colors ${usageMode === "singleUse" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-muted/50"}`}
              >
                <input
                  type="radio"
                  name="usageMode"
                  value="singleUse"
                  checked={usageMode === "singleUse"}
                  onChange={() => setUsageMode("singleUse")}
                  className="mt-0.5 accent-primary scale-110"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold block">
                    {t("adminCreateInvite.singleUse")}
                  </span>
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {t("adminCreateInvite.singleUseHint")}
                  </span>
                </div>
                <UserCheck className="w-4 h-4 text-muted-foreground shrink-0" />
              </label>
              <label
                className={`relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted transition-colors ${usageMode === "limitedUse" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-muted/50"}`}
              >
                <input
                  type="radio"
                  name="usageMode"
                  value="limitedUse"
                  checked={usageMode === "limitedUse"}
                  onChange={() => setUsageMode("limitedUse")}
                  className="mt-0.5 accent-primary scale-110"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold block">
                    {t("adminCreateInvite.limitedUse")}
                  </span>
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {t("adminCreateInvite.limitedUseHint")}
                  </span>
                </div>
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              </label>
            </div>
          </div>

          {/* Usage Limit (conditional) */}
          <div className="space-y-2">
            <label htmlFor="usageLimit" className="text-sm font-semibold block">
              {t("adminCreateInvite.usageLimit")}{" "}
              <span className="text-muted-foreground font-normal">
                {t("adminCreateInvite.forLimitedUse")}
              </span>
            </label>
            <div className="relative w-full sm:w-40">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                id="usageLimit"
                min={1}
                max={100}
                placeholder="5"
                value={usageLimit}
                onChange={(e) =>
                  setUsageLimit(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminCreateInvite.usageLimitHint")}
            </p>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <label htmlFor="expiresAt" className="text-sm font-semibold block">
              {t("adminCreateInvite.expiryDate")}{" "}
              <span className="text-muted-foreground font-normal">
                {t("adminCreateInvite.optional")}
              </span>
            </label>
            <div className="relative w-full sm:w-56">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                id="expiresAt"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminCreateInvite.expiryHint")}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Summary Preview */}
          <div className="bg-muted/60 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("adminCreateInvite.inviteSummary")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">
                  {t("adminCreateInvite.mode")}
                </span>
                <span className="font-medium">{summaryMode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("adminCreateInvite.expires")}
                </span>
                <span className="font-medium">{summaryExpires}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("adminCreateInvite.initialState")}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {t("adminCreateInvite.draft")}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
            <Link
              to="/admin/invites"
              className="w-full sm:w-auto h-11 px-6 inline-flex items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
              {t("adminCreateInvite.cancel")}
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full sm:w-auto h-11 px-8 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              {createMutation.isPending
                ? t("adminCreateInvite.generating")
                : t("adminCreateInvite.generateLink")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
