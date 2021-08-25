import 'package:flutter/material.dart';

class AddPlacePage extends StatefulWidget {
  @override
  _AddPlacePageState createState() => _AddPlacePageState();
}

class _AddPlacePageState extends State<AddPlacePage> {
  final searchController = TextEditingController();

  List<String> _searchResult = [];

  List<String> _locationDetails = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          elevation: 0.0,
          title: TextFormField(
            controller: searchController,
            onChanged: onSearchTextChanged,
            cursorColor: Colors.white,
            style: const TextStyle(
              color: Colors.white,
            ),
            // autofocus: true,
            decoration: InputDecoration(
              hintText: 'Search',
              // labelText: 'Search',
              suffixIcon: IconButton(
                onPressed: search,
                icon: const Icon(Icons.search),
              ),
            ),
          ),
        ),
        body: Container(
          child: _searchResult.isNotEmpty || searchController.text.isNotEmpty
              ? ListView.builder(
                  itemCount: _searchResult.length,
                  itemBuilder: (context, i) {
                    return new ListTile(
                      // leading: new CircleAvatar(backgroundImage: new AssetImage(''),),
                      title: new Text(_searchResult[i]),
                    );
                  },
                )
              : new ListView.builder(
                  itemCount: _locationDetails.length,
                  itemBuilder: (context, index) {
                    return new ListTile(
                      // leading: new CircleAvatar(backgroundImage: new AssetImage(''),),
                      title: new Text(_locationDetails[index]),
                    );
                  },
                ),
        ));
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  void getLocationDetails() async {
    setState(() {
      _locationDetails = ['Makerere', 'Kyambogo'];
    });
  }

  @override
  void initState() {
    super.initState();
    _searchResult = [];
    getLocationDetails();
  }

  onSearchTextChanged(String text) async {
    _searchResult.clear();

    if (text.isEmpty) {
      setState(() {});
      return;
    }

    _locationDetails.forEach((location) {
      if (location.toLowerCase().contains(text.toLowerCase())) {
        _searchResult.add(location);
      }
    });

    setState(() {});
  }

  void search() {}
}
