import PaymentActionCard from "./PaymentActionCard";
import QrCodeActionCard from "./QrCodeActionCard";
import DataViewActionCard from "./DataViewActionCard";

/**
 * ActionCard - Dispatcher component for frontend actions returned by MCP tools
 *
 * When a tool result contains a __frontendAction field, the chat renders this
 * component instead of the default JSON display. It dispatches to the appropriate
 * action-specific card component based on the action type.
 *
 * Supported action types:
 * - "payment" - Renders a PaymentActionCard with a "Pay Now" button
 * - "secret"  - Renders a SecretActionCard showing a secret value as text, barcode, or QR code
 * - "qrcode"  - Renders a generic QR card from any string value
 * - "dataView" - Calls Business API and renders either a grid or gallery
 *
 * To add new action types, import the component and add a case here.
 */
export default function ActionCard({ action }) {
  if (!action || !action.type) return null;

  switch (action.type) {
    case "payment":
      return <PaymentActionCard action={action} />;
    case "qrcode":
      return <QrCodeActionCard action={action} />;
    case "dataView":
      return <DataViewActionCard action={action} />;
    default:
      // Unknown action type - render nothing (tool result will show as normal JSON)
      return null;
  }
}

/**
 * Utility to extract a __frontendAction from a tool result.
 * Returns the action object if found, or null.
 */
export function extractFrontendAction(result) {
  if (!result) return null;

  // Direct check on result object
  if (result.__frontendAction) return result.__frontendAction;

  // Unwrap mcp-client-manager wrapper: { success, service, tool, result: { content: [...] } }
  let data = result;
  if (result?.result?.content) {
    data = result.result;
  }

  // MCP format: { content: [{ type: "text", text: "..." }] }
  if (data?.content && Array.isArray(data.content)) {
    const textContent = data.content.find((c) => c.type === "text");
    if (textContent?.text) {
      try {
        const parsed = JSON.parse(textContent.text);
        if (parsed?.__frontendAction) return parsed.__frontendAction;
      } catch {
        // Not JSON, no action
      }
    }
  }

  return null;
}
