import { useChatStore } from "../../stores/chatStore";

const suggestions = [
  "List all user",
  "Show me the schema for user",
  "What services are available?",
  "Help me understand the system",
];

export default function Suggestions() {
  const { sendMessage, isLoading } = useChatStore();

  const handleSuggestionClick = (suggestion) => {
    if (!isLoading) {
      sendMessage(suggestion);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => handleSuggestionClick(suggestion)}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
