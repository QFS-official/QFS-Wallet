'use client';

// Country flag chips used in the onboarding header/footer
// We use emoji flags to avoid external dependencies

const PRIMARY_FLAGS = ['US', 'AE', 'EU', 'CH', 'CN'];
const SECONDARY_FLAGS = ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'JP', 'KR', 'BR', 'SA', 'MX', 'ZA', 'TR', 'ID', 'AR', 'CO', 'PL', 'IN', 'NG'];

// Map ISO code to emoji flag (using regional indicator symbols)
function isoToEmoji(code: string): string {
  if (code === 'EU') {
    // EU flag isn't a standard regional indicator — use 🇪🇺 which is supported
    return '🇪🇺';
  }
  const A = 0x1F1E6;
  return String.fromCodePoint(
    A + (code.charCodeAt(0) - 65),
    A + (code.charCodeAt(1) - 65)
  );
}

export function FlagsHeader() {
  return (
    <div className="flex items-center gap-2">
      {PRIMARY_FLAGS.map((code) => (
        <div
          key={code}
          className="w-7 h-5 rounded-sm overflow-hidden flex items-center justify-center border border-white/15 bg-white/5"
          title={code}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{isoToEmoji(code)}</span>
        </div>
      ))}
    </div>
  );
}

export function FlagsFooter() {
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center">
      {SECONDARY_FLAGS.map((code, i) => (
        <div
          key={`${code}-${i}`}
          className="w-6 h-4 rounded-sm overflow-hidden flex items-center justify-center border border-white/10 bg-white/5 opacity-70"
          title={code}
        >
          <span style={{ fontSize: 11, lineHeight: 1 }}>{isoToEmoji(code)}</span>
        </div>
      ))}
    </div>
  );
}
