/**
 * Wordmark used everywhere the "FitCheck" name is rendered as text (headers,
 * footers, auth screens, error pages, etc). "Fit" inherits the surrounding
 * text styling; "Check" is locked to Cormorant Garamond italic 400 so the
 * two-tone wordmark stays identical no matter where it's dropped in.
 */
export default function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      Fit
      <span
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "1.15em",
        }}
      >
        Check
      </span>
    </span>
  );
}
