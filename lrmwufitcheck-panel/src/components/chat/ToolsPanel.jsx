import { useState } from "react";
import { useChatStore } from "../../stores/chatStore";
import toast from "react-hot-toast";

export default function ToolsPanel() {
  const {
    tools,
    isLoading,
    refreshTools,
    disabledServices,
    autoFilteredServices,
    toggleService,
  } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedServices, setExpandedServices] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const autoFilteredSet = new Set(
    (autoFilteredServices || []).map((s) => s.service),
  );
  const disabledSet = new Set(disabledServices || []);
  const isServiceDisabled = (service) => disabledSet.has(service);

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshTools();
      if (result.reconnected) {
        toast.success(
          `Reconnected services! ${result.totalTools} tools available.`,
        );
      } else {
        toast.success(`Tools refreshed. ${result.totalTools} tools available.`);
      }
    } catch (error) {
      toast.error("Failed to refresh tools");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group tools by service
  const toolsByService = filteredTools.reduce((acc, tool) => {
    const service = tool.service || "general";
    if (!acc[service]) {
      acc[service] = [];
    }
    acc[service].push(tool);
    return acc;
  }, {});

  const serviceNames = Object.keys(toolsByService);

  const activeToolCount = filteredTools.filter(
    (t) => !isServiceDisabled(t.service || "general"),
  ).length;

  // Toggle expand/collapse of a service section
  const toggleExpand = (service) => {
    setExpandedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

  // Expand all services
  const expandAll = () => {
    const allExpanded = {};
    serviceNames.forEach((service) => {
      allExpanded[service] = true;
    });
    setExpandedServices(allExpanded);
  };

  // Collapse all services
  const collapseAll = () => {
    setExpandedServices({});
  };

  // Check if all services are expanded
  const allExpanded =
    serviceNames.length > 0 &&
    serviceNames.every((service) => expandedServices[service]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary-600 dark:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="font-semibold text-gray-900 dark:text-white">Tools</h3>
          <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
            {activeToolCount}/{tools.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors disabled:opacity-50"
            title="Refresh tools (reconnect services)"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          {/* Expand/Collapse All */}
          {serviceNames.length > 1 && (
            <button
              onClick={allExpanded ? collapseAll : expandAll}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto">
        {tools.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading tools...</span>
              </div>
            ) : (
              "No tools available"
            )}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No tools match your search
          </div>
        ) : (
          Object.entries(toolsByService).map(([service, serviceTools]) => {
            const disabled = isServiceDisabled(service);
            const isAutoFiltered = autoFilteredSet.has(service);
            return (
              <div
                key={service}
                className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${disabled ? "opacity-60" : ""}`}
              >
                {/* Service Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={() => toggleExpand(service)}
                  >
                    {/* Folder/Service icon */}
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <span
                      className={`text-sm font-medium capitalize ${disabled ? "text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {service}
                    </span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                      {serviceTools.length}
                    </span>
                    {isAutoFiltered && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                        auto-filtered
                      </span>
                    )}
                    {/* Expand/Collapse arrow */}
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        expandedServices[service] ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  {/* Service toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleService(service);
                    }}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      disabled
                        ? "bg-gray-300 dark:bg-gray-600"
                        : "bg-primary-600 dark:bg-primary-500"
                    }`}
                    title={
                      disabled
                        ? "Enable service for AI"
                        : "Disable service for AI"
                    }
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        disabled ? "translate-x-0" : "translate-x-4"
                      }`}
                    />
                  </button>
                </div>

                {/* Service Tools - Only shown when expanded */}
                {expandedServices[service] && (
                  <div className="bg-white dark:bg-gray-800">
                    {serviceTools.map((tool) => (
                      <div
                        key={tool.name}
                        className={`px-4 py-3 pl-10 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors ${
                          selectedTool?.name === tool.name
                            ? "bg-primary-50 dark:bg-primary-900/20"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedTool(
                            selectedTool?.name === tool.name ? null : tool,
                          )
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {tool.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {tool.description || "No description available"}
                            </p>
                          </div>
                          {tool.inputSchema?.properties && (
                            <svg
                              className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transition-transform ${
                                selectedTool?.name === tool.name
                                  ? "rotate-180"
                                  : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          )}
                        </div>

                        {/* Expanded Tool Details */}
                        {selectedTool?.name === tool.name &&
                          tool.inputSchema?.properties && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Parameters:
                              </h5>
                              <div className="space-y-1">
                                {Object.entries(
                                  tool.inputSchema.properties || {},
                                ).map(([paramName, paramSchema]) => (
                                  <div
                                    key={paramName}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-primary-600 dark:text-primary-400 flex-shrink-0">
                                      {paramName}
                                    </code>
                                    <span className="text-gray-500 dark:text-gray-400">
                                      {paramSchema.description ||
                                        paramSchema.type}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
