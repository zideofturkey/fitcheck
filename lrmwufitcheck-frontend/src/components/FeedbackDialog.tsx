import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlatPicker } from "@/components/ui/flat-picker";
import { useAuth } from "@/context/AuthContext";
import { useSubmitFeedback } from "@/hooks/api/use-feedback";
import type { FeedbackSubject } from "@/services/api/feedback-api";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUBJECTS: FeedbackSubject[] = ["bug", "featureRequest", "general", "other"];

const EMPTY = { fullName: "", email: "", subject: "" as FeedbackSubject | "", message: "" };

export default function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const submitFeedback = useSubmitFeedback();

  // Opening can be triggered externally (parent flips the `open` prop, e.g.
  // the footer button) rather than via Radix's own onOpenChange, so the
  // prefill has to react to `open` itself instead of living in a change
  // handler that only fires on Radix-internal transitions (Escape/overlay
  // click).
  useEffect(() => {
    if (open) {
      setForm({
        fullName: user?.fullname ?? "",
        email: user?.email ?? "",
        subject: "",
        message: "",
      });
    }
  }, [open, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.subject || !form.message.trim()) {
      toast.error(t("footer.feedbackValidationError"));
      return;
    }
    submitFeedback.mutate(
      {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      },
      {
        onSuccess: () => {
          toast.success(t("footer.feedbackSuccess"));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t("footer.feedbackError"));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("footer.feedback")}</DialogTitle>
          <DialogDescription>{t("footer.feedbackDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t("footer.feedbackFullName")}
            </label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder={t("footer.feedbackFullNamePlaceholder")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t("footer.feedbackEmail")}
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder={t("footer.feedbackEmailPlaceholder")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t("footer.feedbackSubject")}
            </label>
            <FlatPicker
              value={form.subject}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, subject: v as FeedbackSubject }))
              }
              options={SUBJECTS.map((s) => ({
                value: s,
                label: t(`footer.feedbackSubjectOptions.${s}`),
              }))}
              placeholder={t("footer.feedbackSubjectPlaceholder")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t("footer.feedbackMessage")}
            </label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder={t("footer.feedbackMessagePlaceholder")}
              required
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow resize-none"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={submitFeedback.isPending}
          >
            {submitFeedback.isPending
              ? t("footer.feedbackSending")
              : t("footer.feedbackSubmit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
