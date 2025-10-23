interface PostContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PostContent({ content, className, style }: PostContentProps) {
  return (
    <div
      className={className}
      style={{
        margin: '0 0 12px 0',
        color: 'var(--text-primary)',
        lineHeight: '1.6',
        fontSize: '16px',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        ...style
      }}
    >
      {content}
    </div>
  );
}
