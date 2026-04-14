'use client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function FlutterSection() {
  return (
    <section id="flutter" className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          📱 Flutter Package
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          AirQo Icons provides native Flutter widgets with full platform support
          (Android, iOS, Linux, macOS, Web, Windows).
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Installation
          </h3>
          <p className="text-gray-600 mb-2">Add to pubspec.yaml:</p>
          <SyntaxHighlighter
            language="yaml"
            style={vscDarkPlus}
            className="rounded-lg mb-4"
          >
            {`dependencies:
  airqo_icons_flutter: ^1.0.1`}
          </SyntaxHighlighter>
          <p className="text-gray-600 mb-2">Install dependencies:</p>
          <SyntaxHighlighter
            language="bash"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`flutter pub get`}
          </SyntaxHighlighter>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Usage
          </h3>
          <SyntaxHighlighter
            language="dart"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';

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
          </SyntaxHighlighter>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            API Reference
          </h3>
          <p className="text-gray-600 mb-2">
            All icons accept these parameters:
          </p>
          <SyntaxHighlighter
            language="dart"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`Widget AqIconWidget({
  Key? key,                    // Widget key
  double size = 24.0,         // Icon size (default: 24.0)
  Color? color,               // Icon color (uses SVG default if null)
  String? semanticLabel,      // Accessibility label
})`}
          </SyntaxHighlighter>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Advanced Examples
          </h3>

          <h4 className="text-lg font-medium text-gray-800 mt-6 mb-3">
            Material Design Integration
          </h4>
          <SyntaxHighlighter
            language="dart"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`// In App Bar
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
          </SyntaxHighlighter>

          <h4 className="text-lg font-medium text-gray-800 mt-6 mb-3">
            Responsive Icons
          </h4>
          <SyntaxHighlighter
            language="dart"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`class ResponsiveIcon extends StatelessWidget {
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
          </SyntaxHighlighter>

          <h4 className="text-lg font-medium text-gray-800 mt-6 mb-3">
            Accessibility Support
          </h4>
          <SyntaxHighlighter
            language="dart"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`// Provide semantic labels for screen readers
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
          </SyntaxHighlighter>
        </div>
      </div>
    </section>
  );
}
