import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  createJSONEditor,
  JsonEditor,
  type Content,
  type Mode,
} from 'vanilla-jsoneditor';
import clsx from 'clsx';

interface Props {
  value?: Record<string, unknown>;
  onChange?: (value: Record<string, unknown>) => void;
  mode?: Mode;
  readOnly?: boolean;
  className?: string;
}

export interface JsonEditorHandle {
  format: () => void;
}

/**
 * 轻量级 JSON 编辑器（vanilla-jsoneditor）React 包装。
 *
 * 遵循 React 的生命周期模式：
 * 1. 仅在挂载时创建实例，卸载时销毁。
 * 2. 通过 props 更新实例，而不是销毁重建。
 * 3. 使用 ref 解决 onChange 回调的闭包陷阱问题。
 */
const VanillaJsonEditor = forwardRef<JsonEditorHandle, Props>(
  function VanillaJsonEditor(
    {
      value,
      onChange,
      mode = 'code' as Mode,
      readOnly = false,
      className,
    }: Props,
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<JsonEditor | null>(null);

    // 使用 ref 来存储最新的 onChange 回调，防止闭包问题
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // 暴露 format 方法给父组件
    useImperativeHandle(ref, () => ({
      format: () => {
        editorRef.current?.format();
      },
    }));

    // Effect 1: 仅用于创建和销毁编辑器实例
    // 不将 value 放入依赖，避免每次输入都销毁重建
    useEffect(() => {
      if (!containerRef.current) return;

      editorRef.current = createJSONEditor({
        target: containerRef.current,
        props: {
          // 在创建时使用初始值
          content: { json: value ?? {} },
          mode,
          readOnly,
          mainMenuBar: false,
          navigationBar: false,
          statusBar: false,
          onChange: (updatedContent: Content) => {
            // 通过 ref 调用最新的 onChange，避免闭包陷阱
            if (!onChangeRef.current) return;

            if ('json' in updatedContent && updatedContent.json !== undefined) {
              onChangeRef.current(
                updatedContent.json as Record<string, unknown>,
              );
              return;
            }

            if (
              'text' in updatedContent &&
              typeof updatedContent.text === 'string'
            ) {
              try {
                const parsed = JSON.parse(updatedContent.text);
                onChangeRef.current(parsed as Record<string, unknown>);
              } catch {
                /* ignore invalid JSON while typing */
              }
            }
          },
        },
      });

      // 返回一个 cleanup 函数，在组件卸载时销毁编辑器
      return () => {
        editorRef.current?.destroy();
        editorRef.current = null;
      };
    }, [mode, readOnly]);

    // Effect 2: 用于将外部 props 的变化同步到编辑器实例
    // 当 value, mode, readOnly 变化时，调用 editor.updateProps()
    useEffect(() => {
      if (editorRef.current) {
        // 调用实例的 updateProps 方法，而不是销毁重建
        editorRef.current.updateProps({
          content: { json: value ?? {} },
          mode,
          readOnly,
        });
      }
    }, [value, mode, readOnly]);

    return (
      <div
        ref={containerRef}
        className={clsx('w-full h-full vanilla-json-editor', className)}
      />
    );
  },
);

export default VanillaJsonEditor;
