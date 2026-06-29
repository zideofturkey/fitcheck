import { type ReactNode } from "react";

interface Props {
  alignment: "start" | "end"; // maps to flex justify-start/end
  avatarBlock: ReactNode; // the avatar element(s) to render
  bubbleBg: string; // Tailwind bg class e.g. "bg-primary"
  bubbleText: string; // Tailwind text class e.g. "text-primary-foreground"
  messageContent: string;
  suggestedActions: ReactNode; // buttons, chips, etc. inside the bubble
  timeAlignment: "text-left" | "text-right";
  timestamp: string;
}

export default function AiChatBubble({
  alignment,
  avatarBlock,
  bubbleBg,
  bubbleText,
  messageContent,
  suggestedActions,
  timeAlignment,
  timestamp,
}: Props) {
  const alignmentClass =
    alignment === "start" ? "justify-start" : "justify-end";

  return (
    <div className={`flex ${alignmentClass} gap-3 mb-4`}>
      {avatarBlock}
      <div className="max-w-[80%]">
        <div className={`rounded-lg px-4 py-3 ${bubbleBg} ${bubbleText}`}>
          <p className="text-sm whitespace-pre-wrap">{messageContent}</p>
          {suggestedActions}
        </div>
        <span
          className={`text-xs text-muted-foreground mt-1 block ${timeAlignment}`}
        >
          {timestamp}
        </span>
      </div>
    </div>
  );
}
