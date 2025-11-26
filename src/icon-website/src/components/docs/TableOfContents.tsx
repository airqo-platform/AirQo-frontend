export default function TableOfContents() {
  const sections = [
    { id: "installation", title: "Installation" },
    { id: "quick-start", title: "Quick Start" },
    { id: "api-reference", title: "API Reference" },
    { id: "styling", title: "Styling" },
    { id: "typescript", title: "TypeScript" },
    { id: "utilities", title: "Utilities & Hooks" },
    { id: "examples", title: "Examples" },
    { id: "flutter", title: "Flutter Package" },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Table of Contents
      </h3>
      <nav className="space-y-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {s.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
