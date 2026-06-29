import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface ConfirmArchiveDialogProps {
  trigger: React.ReactNode;
  onConfirm: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConfirmArchiveDialog({
  trigger,
  onConfirm,
  open,
  onOpenChange,
}: ConfirmArchiveDialogProps) {
  const [confirmText, setConfirmText] = React.useState("");
  const requiredText = "ARŞİVLE";
  const isDisabled = confirmText !== requiredText;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setConfirmText("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hesabı Arşivle</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem hesabınızı arşivleyecek. Hesabınız 1 ay boyunca geri
            yüklenebilir durumda kalacak, sonrasında kalıcı olarak silinecektir.
            Devam etmek için aşağıya <strong>{requiredText}</strong> yazın.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`${requiredText} yazın`}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDisabled}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hesabımı Arşivle
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
