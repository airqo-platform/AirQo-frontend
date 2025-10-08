"use client";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  code: string;
  title?: string;
  language?: string; // ✅ add this
}

export default function CodeBlock({ code, title, language }: Props) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="relative">
      {title && (
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
          {title}
        </div>
      )}
      <div className="relative">
        <pre
          className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm ${
            title ? "rounded-t-none rounded-b-lg" : "rounded-lg"
          }`}
        >
          <code className={language ? `language-${language}` : ""}>{code}</code>
        </pre>
        <button
          onClick={copy}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
          title="Copy code"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
