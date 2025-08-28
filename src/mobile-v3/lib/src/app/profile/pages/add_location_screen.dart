import 'package:flutter/material.dart';

class AddLocationScreen extends StatefulWidget {
  const AddLocationScreen({super.key});

  @override
  State<AddLocationScreen> createState() => _AddLocationScreenState();
}

class _AddLocationScreenState extends State<AddLocationScreen> {
  String filter = '';
  String selectedCountry = 'All';
  final Map<String, String> countries = {
    'All': '',
    'Near you': '',
    'Uganda': '🇺🇬',
    'Kenya': '🇰🇪',
    'Burundi': '🇧🇮',
    'Ghana': '🇬🇭',
    'Nigeria': '🇳🇬',
    'Cameroon': '🇨🇲',
    'South Africa': '🇿🇦',
    'Mozambique': '🇲🇿',
  };

  List<String> get filteredLocations {
    // Replace with dynamic location fetching logic if needed
    return [];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add zone')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              decoration: const InputDecoration(
                labelText: 'Search Villages, Cities or Countries',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
                filled: true,
                fillColor: Colors.white,
              ),
              onChanged: (value) {
                setState(() {
                  filter = value;
                });
              },
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8.0, // Space between buttons
              runSpacing: 8.0, // Space between rows
              alignment: WrapAlignment.center,
              children: countries.keys.map((country) {
                return ElevatedButton(
                  onPressed: () {
                    setState(() {
                      selectedCountry = country;
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        selectedCountry == country ? Colors.blue : null,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(country),
                      if (countries[country]!.isNotEmpty)
                        Text(countries[country]!),
                    ],
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                children: filteredLocations.map((location) {
                  return ListTile(
                    title: Text(location),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
