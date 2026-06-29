import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <MessageBubble key={message.id || index} message={message} />
      ))}
    </div>
  );
}
