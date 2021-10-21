import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/site.dart';
import 'package:app/screens/search_location_page.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/favourite_place_card.dart';
import 'package:flutter/material.dart';

class FavouritePlaces extends StatefulWidget {
  const FavouritePlaces({Key? key}) : super(key: key);

  @override
  _FavouritePlacesState createState() => _FavouritePlacesState();
}

class _FavouritePlacesState extends State<FavouritePlaces> {
  var favouritePlaces = <Measurement>[];
  var searchResults = <Measurement>[];
  var searchList = <Measurement>[];
  bool isSearching = false;
  TextEditingController searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: ColorConstants.appBodyColor,
        leading: Padding(
          padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
          child: backButton(context),
        ),
        title: const Text(
          'Favorite',
          style: TextStyle(color: Colors.black),
        ),
      ),
      body: Container(
          color: ColorConstants.appBodyColor,
          child: Padding(
              padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
              child: FutureBuilder(
                  future: DBHelper().getFavouritePlaces(),
                  builder: (context, snapshot) {
                    if (snapshot.hasData) {
                      favouritePlaces = snapshot.data as List<Measurement>;

                      if (favouritePlaces.isNotEmpty) {
                        searchList = favouritePlaces;
                      }

                      if (favouritePlaces.isEmpty) {
                        return Center(
                          child: Container(
                            padding: const EdgeInsets.all(16.0),
                            child: OutlinedButton(
                              onPressed: () async {
                                await showSearch(
                                  context: context,
                                  delegate: LocationSearch(),
                                ).then((_) {
                                  setState(() {});
                                });
                              },
                              style: OutlinedButton.styleFrom(
                                shape: const CircleBorder(),
                                padding: const EdgeInsets.all(24),
                              ),
                              child: Text(
                                'Add',
                                style:
                                    TextStyle(color: ColorConstants.appColor),
                              ),
                            ),
                            // child: Text(
                            //   'You haven\'t added any locations you'
                            //   ' care about '
                            //   'to MyPlaces yet, use the add icon at '
                            //   'the top to add them to your list',
                            //   softWrap: true,
                            //   textAlign: TextAlign.center,
                            //   style: TextStyle(
                            //     color: ColorConstants.appColor,
                            //   ),
                            // ),
                          ),
                        );
                      }

                      return RefreshIndicator(
                        color: ColorConstants.appColor,
                        onRefresh: refreshData,
                        child: ListView.builder(
                          itemBuilder: (context, index) => GestureDetector(
                            onTap: () {
                              viewDetails(favouritePlaces[index].site);
                            },
                            child: FavouritePlacesCard(favouritePlaces[index]),
                          ),
                          itemCount: favouritePlaces.length,
                        ),
                      );
                    } else {
                      return Center(
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(
                              ColorConstants.appColor),
                        ),
                      );
                    }
                  }))),
    );
  }

  void doSearch(String query) {
    query = query.toLowerCase();

    if (query.isNotEmpty) {
      if (mounted) {
        setState(() {
          searchResults.clear();
        });
      }

      var dummyListData = <Measurement>[];
      for (var measurement in searchList) {
        var site = measurement.site;

        if ((site.description.toLowerCase().contains(query)) ||
            (site.name.toLowerCase().contains(query)) ||
            (site.district.toLowerCase().contains(query)) ||
            (site.country.toLowerCase().contains(query))) {
          dummyListData.add(measurement);
        }
      }

      if (mounted) {
        setState(() {
          searchResults = dummyListData;
        });
      }

      return;
    } else {
      if (mounted) {
        setState(() {
          searchResults.clear();
        });
      }
    }
  }

  Future<void> exitSearch() async {
    setState(() {
      isSearching = false;
    });
  }

  Future<void> refreshData() async {
    await DBHelper().getFavouritePlaces().then((value) => {
          if (mounted)
            {
              setState(() {
                favouritePlaces = value;
              })
            }
        });
  }

  Future<void> removeFromFavourites(Site site) async {
    await DBHelper().updateFavouritePlaces(site).then((value) => {
          showSnackBar(context, '${site.getName()} is removed from your places')
        });

    if (mounted) {
      setState(() {});
    }
  }

  Future<void> viewDetails(Site site) async {
    // await Navigator.push(context, MaterialPageRoute(builder: (context) {
    //   return PlaceDetailsPage(site: site);
    // })).then((value) {
    //   setState(() {});
    // });
  }
}
