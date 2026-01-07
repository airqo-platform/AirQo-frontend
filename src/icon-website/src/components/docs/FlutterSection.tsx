// components/docs/FlutterSection.tsx
import React from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

const modernBlue = "#0A84FF";

export default function FlutterSection() {
  return (
    <DocSection id="flutter" title="📱 Flutter Package">
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        AirQo Icons provides native Flutter widgets with full platform support
        (Android, iOS, Linux, macOS, Web, Windows).
      </p>

      {/* Installation */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Installation
        </h3>
        <CodeBlock
          title="pubspec.yaml"
          code={`dependencies:
  airqo_icons_flutter: ^1.0.1`}
          language="yaml"
        />
        <div className="mt-4">
          <CodeBlock
            title="Install Dependencies"
            code={`flutter pub get`}
            language="bash"
          />
        </div>
      </div>

      {/* Basic Usage */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Basic Usage
        </h3>
        <CodeBlock
          title="Import and Use"
          code={`import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        AqUganda(size: 32, color: Colors.green),
        AqHome01(size: 24, color: Colors.blue),
        AqBarChart01(size: 28, color: Colors.purple),
      ],
    );
  }
}`}
          language="dart"
        />
      </div>

      {/* API Reference */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          API Reference
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          All icons accept these parameters:
        </p>
        <CodeBlock
          title="Widget Parameters"
          code={`Widget AqIconWidget({
  Key? key,                    // Widget key
  double size = 24.0,         // Icon size (default: 24.0)
  Color? color,               // Icon color (uses SVG default if null)
  String? semanticLabel,      // Accessibility label
})`}
          language="dart"
        />
      </div>

      {/* Advanced Examples */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Advanced Examples
        </h3>

        <div className="space-y-6">
          {/* Material Design Integration */}
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Material Design Integration
            </h4>
            <CodeBlock
              title="App Bar and Navigation"
              code={`// In App Bar
AppBar(
  leading: AqMenu01(color: Colors.white),
  title: Text('AirQo Dashboard'),
  actions: [
    IconButton(
      icon: AqNotificationSquare(color: Colors.white),
      onPressed: () => _showNotifications(),
    ),
  ],
)

// In Bottom Navigation
BottomNavigationBar(
  items: [
    BottomNavigationBarItem(
      icon: AqHome01(),
      label: 'Home',
    ),
    BottomNavigationBarItem(
      icon: AqBarChart01(),
      label: 'Analytics',
    ),
    BottomNavigationBarItem(
      icon: AqUser01(),
      label: 'Profile',
    ),
  ],
)`}
              language="dart"
            />
          </div>

          {/* Responsive Icons */}
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Responsive Icons
            </h4>
            <CodeBlock
              title="Responsive Design"
              code={`class ResponsiveIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final iconSize = screenWidth > 600 ? 32.0 : 24.0;

    return AqHome01(
      size: iconSize,
      color: Theme.of(context).primaryColor,
    );
  }
}`}
              language="dart"
            />
          </div>

          {/* Accessibility */}
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accessibility Support
            </h4>
            <CodeBlock
              title="Semantic Labels"
              code={`// Provide semantic labels for screen readers
AqHome01(
  semanticLabel: 'Navigate to home screen',
)

// Use in semantic widgets
Semantics(
  button: true,
  hint: 'Tap to open settings',
  child: GestureDetector(
    onTap: _openSettings,
    child: AqSettings01(),
  ),
)`}
              language="dart"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2">
          ✨ Features
        </h4>
        <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
          <li>• 🎯 1,383 icons across 22 comprehensive categories</li>
          <li>• 🏷️ Aq prefix naming convention (AqHome01, AqUser, etc.)</li>
          <li>• 📱 Flutter 3.0+ compatible with latest framework features</li>
          <li>• 🎨 Fully customizable - size, color, semantic labels</li>
          <li>• 🌍 Global coverage - 196 country flags A-Z</li>
          <li>• ⚡ Performance optimized - SVG-based with minimal overhead</li>
          <li>• ♿ Accessibility ready - Built-in semantic label support</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <a
          href="https://pub.dev/packages/airqo_icons_flutter"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow hover:shadow-md transition-shadow"
          style={{ backgroundColor: modernBlue }}
        >
          View on pub.dev
        </a>
        <a
          href="https://pub.dev/documentation/airqo_icons_flutter/latest/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          API Documentation
        </a>
      </div>
    </DocSection>
  );
}
