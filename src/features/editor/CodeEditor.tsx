"use client";

import Editor, { Monaco } from "@monaco-editor/react";
import { usePlayground } from "@/hooks/usePlayground";
import { useEffect } from "react";

export default function CodeEditor() {
  const { files, activeFileName, setFileContent } = usePlayground();
  const activeFile = files[activeFileName] || { content: "", language: "typescript" };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFileContent(activeFileName, value);
    }
  };

  const handleEditorDidMount = (editor: unknown, monaco: Monaco) => {
    // Define custom orange-black cyberpunk theme for Monaco
    monaco.editor.defineTheme("xeus-cyberpunk", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "E0E0E0", background: "000000" },
        { token: "comment", foreground: "7F7F7F", fontStyle: "italic" },
        { token: "keyword", foreground: "FF5500", fontStyle: "bold" },
        { token: "string", foreground: "FDCF58" },
        { token: "number", foreground: "FF9E00" },
        { token: "type", foreground: "00F3FF" },
        { token: "class", foreground: "00F3FF" },
        { token: "function", foreground: "FFAE00" },
        { token: "variable", foreground: "FFFFFF" },
      ],
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#E0E0E0",
        "editor.lineHighlightBackground": "#0D0803",
        "editor.lineHighlightBorder": "#221100",
        "editor.selectionBackground": "#3D1D00",
        "editorCursor.foreground": "#FF5500",
        "editorLineNumber.foreground": "#555555",
        "editorLineNumber.activeForeground": "#FF5500",
        "editorWidget.background": "#0A0A0A",
        "editorWidget.border": "#221100",
      },
    });
    monaco.editor.setTheme("xeus-cyberpunk");
  };

  return (
    <div className="w-full h-full bg-black relative flex flex-col overflow-hidden">
      <div className="flex-1 w-full h-full">
        <Editor
          height="100%"
          width="100%"
          language={activeFile.language}
          value={activeFile.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="xeus-cyberpunk"
          options={{
            fontSize: 14,
            fontFamily: '"Geist Mono", monospace',
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            padding: { top: 12, bottom: 12 },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  );
}
