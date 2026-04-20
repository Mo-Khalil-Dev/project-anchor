interface TrustFooterProps {
  className?: string;
  icon?: '🔒' | '🛡️' | '📱';
  text: string;
}

export function TrustFooter({ className = '', icon = '🔒', text }: TrustFooterProps) {
  return (
    <div
      className={`text-center text-sm leading-relaxed ${className}`}
      style={{
        color: 'var(--muted)',
        fontSize: '13px',
        fontWeight: 400,
      }}
    >
      {icon} {text}
    </div>
  );
}
