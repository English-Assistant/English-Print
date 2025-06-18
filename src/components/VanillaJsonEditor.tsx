import { useEffect, useRef } from 'react';
import { createJSONEditor, type Content, type Mode } from 'vanilla-jsoneditor';
// import 'vanilla-jsoneditor/themes/jse-theme-default.css?inline';

type EditorInstance = ReturnType<typeof createJSONEditor>;

interface Props {
  value: Record<string, unknown>;
  onChange?: (value: Record<string, unknown>) => void;
  mode?: Mode;
  readOnly?: boolean;
}

/**
 * 轻量级 JSON 编辑器（vanilla-jsoneditor）React 包装。
 *
 * 注意：组件内部保持不可控编辑器实例，通过 props.value 更新。
 */
export default function VanillaJsonEditor({
  value,
  onChange,
  mode = 'text' as Mode,
  readOnly = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorInstance | null>(null);

  // 仅在初次挂载时创建实例
  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = createJSONEditor({
      target: containerRef.current,
      props: {
        content: { json: value },
        mode,
        readOnly,
        mainMenuBar: false,
        navigationBar: false,
        statusBar: false,
        onChange: (updatedContent: Content) => {
          if (onChange && 'json' in updatedContent && updatedContent.json) {
            onChange(updatedContent.json as Record<string, unknown>);
          }
        },
      },
    });

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
    // containerRef 不会变化，确保仅执行一次
  }, [mode, onChange, readOnly, value]);

  // props 变化时同步到编辑器
  useEffect(() => {
    if (!editorRef.current) return;

    editorRef.current.updateProps({
      content: { json: value },
      mode,
      readOnly,
      onChange: (updatedContent: Content) => {
        if (onChange && 'json' in updatedContent && updatedContent.json) {
          onChange(updatedContent.json as Record<string, unknown>);
        }
      },
    });
  }, [value, mode, readOnly, onChange]);

  return <div ref={containerRef} className="w-full h-full" />;
}
