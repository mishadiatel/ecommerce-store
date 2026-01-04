import { useEffect, useRef } from 'react';

export default function IframePreview({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;

    if (!doc) return;

    doc.open();
    doc.write(html || '<div style="color:#999">Empty content</div>');
    doc.close();
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        minHeight: 200,
        border: '1px solid #ddd',
        borderRadius: 8,
        background: '#fff',
      }}
    />
  );
}

