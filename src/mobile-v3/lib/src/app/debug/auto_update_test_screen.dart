import 'package:flutter/material.dart';

void main() {
  runApp(const AutoUpdateTestApp());
}

class AutoUpdateTestApp extends StatelessWidget {
  const AutoUpdateTestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Auto Update Test',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const AutoUpdateTestScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AppColors {
  const AppColors._();

  static Color primaryColor = Color(0xff145FFF);
  static Color backgroundColor2 = Color(0xffFAFAFA);
  static Color borderColor2 = Color(0xffE1E7EC);
  static Color backgroundColor = Color(0xffF9FAFB);
  static Color highlightColor = Color(0xffF3F6F8);
  static Color boldHeadlineColor = Color(0xff6F87A1);
  static Color boldHeadlineColor2 = Color(0xff9EA3AA);
  static Color boldHeadlineColor3 = Color(0xff7A7F87);
  static Color boldHeadlineColor4 = Color(0xff2E2F33);
  static Color highlightColor2 = Color(0xffE2E3E5);
  static Color secondaryHeadlineColor = Color(0xff6F87A1);
  static Color darkThemeBackground = Color(0xff1C1D20);
  static Color secondaryHeadlineColor2 = Color(0xff60646C);
  static Color secondaryHeadlineColor3 = Color(0xff7A7F87);
  static Color dividerColordark = Color(0xff3E4147);
  static Color dividerColorlight = Color(0xffE1E7EC);
  static Color boldHeadlineColor5 = Color(0xff3F4B5F);
  static Color pmcolorlight = Color(0xff9EB0C2);
  static Color secondaryHeadlineColor4 = Color(0xff6F87A1);
  static Color navigationlight = Color(0xff485972);
  static Color darkHighlight = Color(0xFF2E2F33);
  static Color lightHighlight = Color(0xFFF3F6F8);
}

// App Theme (copied from your theme)
class AppTheme {
  static final ThemeData lightTheme = ThemeData(
    splashColor: Colors.transparent,
    fontFamily: "Inter",
    useMaterial3: true,
    appBarTheme: AppBarTheme(
      scrolledUnderElevation: 0,
      elevation: 0,
      backgroundColor: const Color(0xffF9FAFB),
    ),
    brightness: Brightness.light,
    primaryColor: const Color(0xff145FFF),
    scaffoldBackgroundColor: const Color(0xffF9FAFB),
    highlightColor: const Color(0xffF3F6F8),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        color: const Color(0xff000000),
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: Colors.black,
      ),
      headlineSmall: TextStyle(
        color: const Color(0xff000000),
      ),
      titleMedium: TextStyle(color: const Color(0xff000000)),
      titleLarge: TextStyle(
        fontSize: 40,
        fontWeight: FontWeight.w700,
        color: Colors.black,
      ),
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    splashColor: Colors.transparent,
    fontFamily: "Inter",
    useMaterial3: true,
    appBarTheme: AppBarTheme(
      scrolledUnderElevation: 0,
      elevation: 0,
      backgroundColor: const Color(0xff1C1D20),
    ),
    brightness: Brightness.dark,
    primaryColor: const Color(0xff145FFF),
    scaffoldBackgroundColor: const Color(0xff1C1D20),
    highlightColor: const Color(0xff2E2F33),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        color: const Color(0xff9EA3AA),
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: const Color(0xff60646C),
      ),
      headlineSmall: TextStyle(
        color: const Color(0xff7A7F87),
      ),
      titleMedium: TextStyle(color: const Color(0xffE2E3E5)),
      titleLarge: TextStyle(
        fontSize: 40,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      ),
    ),
  );
}

class AutoUpdateTestScreen extends StatefulWidget {
  const AutoUpdateTestScreen({super.key});

  @override
  State<AutoUpdateTestScreen> createState() => _AutoUpdateTestScreenState();
}

class _AutoUpdateTestScreenState extends State<AutoUpdateTestScreen> {
  bool _isLoading = false;
  String _lastResult = "";
  final _currentVersionController = TextEditingController(text: "1.0.0");
  final _latestVersionController = TextEditingController(text: "1.1.0");
  final _packageNameController = TextEditingController(text: "com.example.airqo");

  @override
  void dispose() {
    _currentVersionController.dispose();
    _latestVersionController.dispose();
    _packageNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Auto Update UI'),
        backgroundColor: AppColors.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(isDarkMode ? Icons.light_mode : Icons.dark_mode),
            onPressed: () {
              // This won't work in the test app, but shows the concept
              // In your real app, this would trigger ThemeBloc
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Card
            Card(
              elevation: 2,
              color: Theme.of(context).highlightColor,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            Icons.system_update, 
                            color: AppColors.primaryColor, 
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Update Dialog Tester',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isDarkMode 
                                ? Colors.white 
                                : AppColors.boldHeadlineColor4,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Configure version settings and test the update dialog UI',
                      style: TextStyle(
                        color: isDarkMode 
                            ? AppColors.secondaryHeadlineColor2 
                            : AppColors.secondaryHeadlineColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Version Configuration Card
            Card(
              elevation: 2,
              color: Theme.of(context).highlightColor,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Version Configuration',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode 
                            ? Colors.white 
                            : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Current Version Input
                    TextFormField(
                      controller: _currentVersionController,
                      style: TextStyle(
                        color: isDarkMode 
                            ? Colors.white 
                            : AppColors.boldHeadlineColor4,
                      ),
                      decoration: InputDecoration(
                        labelText: 'Current Version',
                        hintText: 'e.g., 1.0.0',
                        labelStyle: TextStyle(
                          color: isDarkMode 
                              ? AppColors.secondaryHeadlineColor2 
                              : AppColors.secondaryHeadlineColor,
                        ),
                        border: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: isDarkMode 
                                ? AppColors.dividerColordark 
                                : AppColors.dividerColorlight,
                          ),
                        ),
                        prefixIcon: Icon(
                          Icons.phone_android,
                          color: AppColors.primaryColor,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    // Latest Version Input
                    TextFormField(
                      controller: _latestVersionController,
                      style: TextStyle(
                        color: isDarkMode 
                            ? Colors.white 
                            : AppColors.boldHeadlineColor4,
                      ),
                      decoration: InputDecoration(
                        labelText: 'Latest Version (Store)',
                        hintText: 'e.g., 1.1.0',
                        labelStyle: TextStyle(
                          color: isDarkMode 
                              ? AppColors.secondaryHeadlineColor2 
                              : AppColors.secondaryHeadlineColor,
                        ),
                        border: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: isDarkMode 
                                ? AppColors.dividerColordark 
                                : AppColors.dividerColorlight,
                          ),
                        ),
                        prefixIcon: Icon(
                          Icons.cloud_download,
                          color: AppColors.primaryColor,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    // Package Name Input
                    TextFormField(
                      controller: _packageNameController,
                      style: TextStyle(
                        color: isDarkMode 
                            ? Colors.white 
                            : AppColors.boldHeadlineColor4,
                      ),
                      decoration: InputDecoration(
                        labelText: 'Package Name',
                        hintText: 'com.example.app',
                        labelStyle: TextStyle(
                          color: isDarkMode 
                              ? AppColors.secondaryHeadlineColor2 
                              : AppColors.secondaryHeadlineColor,
                        ),
                        border: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: isDarkMode 
                                ? AppColors.dividerColordark 
                                : AppColors.dividerColorlight,
                          ),
                        ),
                        prefixIcon: Icon(
                          Icons.apps,
                          color: AppColors.primaryColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Test Buttons Card
            Card(
              elevation: 2,
              color: Theme.of(context).highlightColor,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Test Actions',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode 
                            ? Colors.white 
                            : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _showUpdateDialog,
                      icon: const Icon(Icons.visibility),
                      label: const Text('Show Update Dialog'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _showMajorUpdateDialog,
                      icon: const Icon(Icons.upgrade),
                      label: const Text('Test Major Update (1.0.0 → 2.0.0)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange.shade700,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Test Minor Update
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _showMinorUpdateDialog,
                      icon: const Icon(Icons.update),
                      label: const Text('Test Minor Update (1.0.0 → 1.0.1)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade700,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Test with Long Version Numbers
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _showLongVersionDialog,
                      icon: const Icon(Icons.format_list_numbered),
                      label: const Text('Test Long Versions (1.2.3.4 → 1.2.3.5)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple.shade700,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Loading Indicator
            if (_isLoading)
              Card(
                color: Theme.of(context).highlightColor,
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        'Processing...',
                        style: TextStyle(
                          color: isDarkMode 
                              ? Colors.white 
                              : AppColors.boldHeadlineColor4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            // Results Card
            if (_lastResult.isNotEmpty)
              Card(
                elevation: 2,
                color: Theme.of(context).highlightColor,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Last Result',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isDarkMode 
                              ? Colors.white 
                              : AppColors.boldHeadlineColor4,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDarkMode 
                              ? AppColors.dividerColordark 
                              : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isDarkMode 
                                ? AppColors.dividerColordark 
                                : Colors.grey.shade300,
                          ),
                        ),
                        child: Text(
                          _lastResult,
                          style: TextStyle(
                            fontSize: 14,
                            color: isDarkMode 
                                ? Colors.white 
                                : AppColors.boldHeadlineColor4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 20),

            // Info Card
            Card(
              color: AppColors.primaryColor.withOpacity(0.1),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.info, color: AppColors.primaryColor),
                        const SizedBox(width: 8),
                        Text(
                          'Testing Information',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: isDarkMode 
                                ? Colors.white 
                                : AppColors.boldHeadlineColor4,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '• Use the preset buttons for common scenarios\n'
                      '• Customize versions in the fields above\n'
                      '• Test how the dialog looks with different version formats\n'
                      '• Check button interactions and user flow\n'
                      '• Perfect for UI/UX review and screenshots\n'
                      '• Dialog automatically adapts to light/dark theme',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDarkMode 
                            ? AppColors.secondaryHeadlineColor2 
                            : AppColors.secondaryHeadlineColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showUpdateDialog() {
    _showCustomUpdateDialog(
      _currentVersionController.text.trim(),
      _latestVersionController.text.trim(),
      _packageNameController.text.trim(),
    );
  }

  void _showMajorUpdateDialog() {
    _showCustomUpdateDialog("1.0.0", "2.0.0", "com.example.airqo");
  }

  void _showMinorUpdateDialog() {
    _showCustomUpdateDialog("1.0.0", "1.0.1", "com.example.airqo");
  }

  void _showLongVersionDialog() {
    _showCustomUpdateDialog("1.2.3.4", "1.2.3.5", "com.example.airqo");
  }

  void _showCustomUpdateDialog(String currentVersion, String latestVersion, String packageName) {
    setState(() {
      _isLoading = true;
      _lastResult = "Showing update dialog for $currentVersion → $latestVersion";
    });

    // Small delay to show loading state
    Future.delayed(const Duration(milliseconds: 300), () {
      setState(() {
        _isLoading = false;
      });

      final isDarkMode = Theme.of(context).brightness == Brightness.dark;

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: isDarkMode 
              ? AppColors.darkHighlight 
              : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.system_update, 
                  color: AppColors.primaryColor, 
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Update Available',
                  style: TextStyle(
                    color: isDarkMode 
                        ? Colors.white 
                        : AppColors.boldHeadlineColor4,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDarkMode 
                      ? AppColors.dividerColordark 
                      : AppColors.lightHighlight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Current:', 
                          style: TextStyle(
                            fontWeight: FontWeight.w500,
                            color: isDarkMode 
                                ? AppColors.secondaryHeadlineColor2 
                                : AppColors.boldHeadlineColor4,
                          ),
                        ),
                        Text(
                          currentVersion,
                          style: TextStyle(
                            color: isDarkMode 
                                ? Colors.white 
                                : AppColors.boldHeadlineColor4,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Latest:', 
                          style: TextStyle(
                            fontWeight: FontWeight.w500,
                            color: isDarkMode 
                                ? AppColors.secondaryHeadlineColor2 
                                : AppColors.boldHeadlineColor4,
                          ),
                        ),
                        Text(
                          latestVersion, 
                          style: const TextStyle(
                            color: Colors.green, 
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: AppColors.primaryColor.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.star, 
                      color: AppColors.primaryColor, 
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Get the latest features and improvements by updating now.',
                        style: TextStyle(
                          fontSize: 14,
                          color: isDarkMode 
                              ? Colors.white 
                              : AppColors.boldHeadlineColor4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                setState(() {
                  _lastResult = "✅ User selected: Skip This Version ($latestVersion)";
                });
              },
              style: TextButton.styleFrom(
                foregroundColor: isDarkMode 
                    ? AppColors.secondaryHeadlineColor2 
                    : AppColors.secondaryHeadlineColor,
              ),
              child: const Text('Skip This Version'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                setState(() {
                  _lastResult = "✅ User selected: Later";
                });
              },
              style: TextButton.styleFrom(
                foregroundColor: isDarkMode 
                    ? AppColors.secondaryHeadlineColor2 
                    : AppColors.secondaryHeadlineColor,
              ),
              child: const Text('Later'),
            ),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
                setState(() {
                  _lastResult = "✅ User selected: Update (would open Play Store for $packageName)";
                });
              },
              icon: const Icon(Icons.download),
              label: const Text('Update'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    });
  }
}