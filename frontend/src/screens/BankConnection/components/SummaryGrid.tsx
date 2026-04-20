interface SummaryGridItem {
  label: string;
  value: string | number;
}

interface SummaryGridProps {
  items: SummaryGridItem[];
  className?: string;
}

export function SummaryGrid({ items, className = '' }: SummaryGridProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-4 ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        margin: '24px 0',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
