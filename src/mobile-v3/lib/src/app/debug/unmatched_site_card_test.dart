import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/widgets/unmatched_site_card.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';

void main() {
  runApp(TestApp());
}

class TestApp extends StatelessWidget {
  const TestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Unmatched Site Card Test',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        highlightColor: Colors.white,
      ),
      home: TestScreen(),
    );
  }
}

class TestScreen extends StatelessWidget {
  const TestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Test Unmatched Site Card')),
      body: ListView(
        children: [
          SizedBox(height: 20),
          UnmatchedSiteCard(
            site: SelectedSite(
              id: 'test-1',
              name: 'Downtown Test Area',
              searchName: 'Downtown Test Area, Test City, Test Country',

            ),
            onRemove: (id) {
            },
          ),
        ],
      ),
    );
  }
}