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
        color: '#9197ab',
        fontSize: '13px',
        fontWeight: 400,
      }}
    >
      {icon} {text}
    </div>
  );
}
