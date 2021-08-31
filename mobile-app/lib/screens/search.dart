import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/services/local_storage.dart';
import 'package:flutter/material.dart';

class SearchPage extends StatefulWidget {
  final String title = 'Search';

  @override
  _SearchPageState createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  TextEditingController editingController = TextEditingController();

  var dbSites = <Site>[];
  var sites = <Site>[];
  var dbHelper = DBHelper();
  bool notFound = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextFormField(
          controller: editingController,
          onChanged: (value) {
            print('Value changed');
            filterSearchResults(value);
          },
          cursorColor: Colors.white,
          style: const TextStyle(
            color: Colors.white,
          ),
          // autofocus: true,
          decoration: InputDecoration(
            hintText: 'Search',
            // labelText: 'Search',
            suffixIcon: IconButton(
              onPressed: () {},
              icon: const Icon(Icons.search),
            ),
          ),
        ),
        // title: TextFormField(
        //   onChanged: (value) {
        //     print('Value changed');
        //     filterSearchResults(value);
        //   },
        //   controller: editingController,
        //   decoration: const InputDecoration(
        //     labelText: 'Search',
        //     hintText: 'Search',
        //     suffixIcon: Icon(Icons.search),
        //   ),
        // ),
      ),
      body: Container(
        child: Column(
          children: <Widget>[
            // Padding(
            //   padding: const EdgeInsets.all(8.0),
            //   child: TextField(
            //     onChanged: (value) {
            //       print('Value changed');
            //       filterSearchResults(value);
            //     },
            //     controller: editingController,
            //     decoration: const InputDecoration(
            //         labelText: 'Search',
            //         hintText: 'Search',
            //         prefixIcon: Icon(Icons.search),
            //         border: OutlineInputBorder(
            //             borderRadius: BorderRadius.all(Radius.circular(25.0)))),
            //   ),
            // ),
            notFound
                ? const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text('Not found'),
                  )
                : const Text(''),
            Expanded(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: sites.length,
                itemBuilder: (context, index) {
                  return InkWell(
                      onTap: () {
                        var site = sites[index];
                        Navigator.push(context,
                            MaterialPageRoute(builder: (context) {
                          return PlaceDetailsPage(
                            site: site,
                          );
                        }));
                      },
                      child: ListTile(
                        title: Text('${sites[index].getName()}'),
                        subtitle: Text('${sites[index].getLocation()}'),
                        leading: Icon(
                          Icons.location_pin,
                          color: ColorConstants().appColor,
                        ),
                      ) //your content here
                      );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    editingController.dispose();
    super.dispose();
  }

  void filterSearchResults(String query) async {
    query = query.toLowerCase();

    if (query.isNotEmpty) {
      var dummyListData = <Site>[];
      for (var site in dbSites) {
        if ((site.description.toLowerCase().contains(query)) ||
            (site.name.toLowerCase().contains(query)) ||
            (site.district.toLowerCase().contains(query)) ||
            (site.country.toLowerCase().contains(query))) {
          dummyListData.add(site);
        }
      }

      setState(() {
        sites.clear();

        for (var site in dummyListData) {
          sites.add(site);
        }
      });

      if (sites.isEmpty) {
        notFound = true;
      } else {
        notFound = false;
      }
      return;
    } else {
      print(dbSites.length);
      setState(() {
        sites.clear();
        for (var site in dbSites) {
          sites.add(site);
        }
      });
    }
  }

  Future<void> getSites() async {
    // await getSitesLocally();
    //
    // var results = await AirqoApiClient(context).fetchSites();
    //
    // if (results.isNotEmpty) {
    //   updateLists(results);
    //   await dbHelper.insertSites(results);
    // }
  }

  Future<void> getSitesLocally() async {
    // var offlineSites = await dbHelper.getSites();
    //
    // if (offlineSites.isNotEmpty) {
    //   updateLists(offlineSites);
    // }
  }

  @override
  void initState() {
    notFound = false;
    getSites();

    super.initState();
  }

  void updateLists(List<Site> results) {
    setState(() {
      notFound = false;
      dbSites.clear();
      sites.clear();
      dbSites.addAll(results);
      sites.addAll(results);
    });
  }
}
