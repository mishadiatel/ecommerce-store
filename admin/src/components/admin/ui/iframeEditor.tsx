import { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import Editor from 'react-simple-wysiwyg';

export default function IframeEditor({ value, onChange }: {value: string, onChange: (value: string) => void}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html>
        <head>
          <style type="text/css">.rsw-editor{border:1px solid #ddd;border-radius:.375rem;display:flex;flex-direction:column;min-height:100px;overflow:hidden}.rsw-ce{flex:1 1 auto;overflow:auto;padding:.5rem}.rsw-ce:focus{outline:1px solid #668}.rsw-ce[contentEditable=true]:empty:not(:focus):before{color:grey;content:attr(placeholder);pointer-events:none}.rsw-html{background:transparent;border:none;font-family:monospace,Courier New}.rsw-separator{align-self:stretch;border-right:1px solid #ddd;display:flex;margin:0 3px}.rsw-dd{box-sizing:border-box;outline:none}.rsw-btn{background:transparent;border:0;color:#222;cursor:pointer;font-size:1em;height:2em;outline:none;padding:0;width:2em}.rsw-btn:hover{background:#eaeaea}.rsw-btn[data-active=true]{background:#e0e0e0}.rsw-toolbar{align-items:center;background-color:#f5f5f5;border-bottom:1px solid #ddd;display:flex}</style>
        </head>
        <body>
          <div id="editor-root"></div>
        </body>
      </html>
    `);
    doc.close();

    const mount = doc.getElementById('editor-root');
    if(mount) {
      rootRef.current = createRoot(mount);
    }


    return () => rootRef.current?.unmount();
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;

    rootRef.current.render(<InnerEditor value={value} onChange={onChange} />);
  }, [onChange]);

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', height: 300, border: '1px solid rgb(221, 221, 221)', borderRadius: 8 }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

function InnerEditor({ value, onChange }: {value: string, onChange: (value: string) => void}) {
  const [local, setLocal] = useState(value);

  return (
    <Editor
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);   // курсор залишається
        onChange(e.target.value);   // лізе в React форму
      }}
    />
  );
}
