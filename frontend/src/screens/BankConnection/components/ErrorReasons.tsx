const DEFAULT_REASONS = [
  'Incorrect login details',
  'Bank service temporarily unavailable',
  'Cancelled during login',
  "Bank doesn't support Open Banking yet",
];

interface ErrorReasonsProps {
  reasons?: string[];
  className?: string;
}

export function ErrorReasons({ reasons = DEFAULT_REASONS, className = '' }: ErrorReasonsProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--redBg)',
        border: '1px solid rgba(192, 57, 43, 0.2)',
        borderRadius: '14px',
        padding: '16px',
        marginTop: '20px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--red)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          marginBottom: '12px',
        }}
      >
        Why this might happen:
      </div>
      <ul
        style={{
          margin: 0,
          paddingLeft: '20px',
          listStyle: 'disc',
        }}
      >
        {reasons.map((reason, idx) => (
          <li
            key={idx}
            style={{
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 400,
              marginBottom: '6px',
              lineHeight: 1.5,
            }}
          >
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
