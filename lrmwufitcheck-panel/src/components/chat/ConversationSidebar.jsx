import { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { cn } from "../../utils/cn";

export default function ConversationSidebar() {
  const {
    conversations,
    conversationsLoading,
    conversationId,
    loadConversations,
    loadConversation,
    newConversation,
    updateConversationTitle,
    deleteConversation,
  } = useChatStore();

  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSelectConversation = (id) => {
    if (id !== conversationId) {
      loadConversation(id);
    }
  };

  const handleNewConversation = () => {
    newConversation();
  };

  const handleStartEdit = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveTitle = async (e) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      await updateConversationTitle(editingId, editingTitle.trim());
      loadConversations();
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingTitle("");
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    await deleteConversation(id);
    setDeletingId(null);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={handleNewConversation}
          className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="New conversation"
        >
          <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          Conversations
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewConversation}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="New conversation"
          >
            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversationsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No conversations yet
            </p>
            <button
              onClick={handleNewConversation}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Start a new chat
            </button>
          </div>
        ) : (
          <div className="py-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  "group px-3 py-2 mx-2 rounded-lg cursor-pointer transition-colors",
                  conversationId === conv.id
                    ? "bg-primary-100 dark:bg-primary-900/30"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700",
                )}
              >
                {editingId === conv.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle(e);
                        if (e.key === "Escape") handleCancelEdit(e);
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          conversationId === conv.id
                            ? "text-primary-700 dark:text-primary-300"
                            : "text-gray-900 dark:text-white",
                        )}
                      >
                        {conv.title || "Untitled"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDate(conv.updatedAt)} · {conv.messageCount || 0}{" "}
                        msgs
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartEdit(conv, e)}
                        className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        title="Delete"
                        disabled={deletingId === conv.id}
                      >
                        {deletingId === conv.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                        ) : (
                          <Trash2 className="w-3 h-3 text-red-500" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => loadConversations()}
          className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
