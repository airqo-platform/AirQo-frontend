import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/site.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/screens/search_location_page.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';

class MyPlaces extends StatefulWidget {
  const MyPlaces({Key? key}) : super(key: key);

  @override
  _MyPlacesState createState() => _MyPlacesState();
}

class _MyPlacesState extends State<MyPlaces> {
  var results = <Measurement>[];
  var searchResults = <Measurement>[];
  var searchList = <Measurement>[];
  bool isSearching = false;
  TextEditingController searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(color: ColorConstants.appColor),
        elevation: 0.0,
        title: isSearching
            ? TextField(
                autofocus: true,
                controller: searchController,
                onSubmitted: doSearch,
                onChanged: doSearch,
                onTap: () {},
                style: TextStyle(fontSize: 18, color: ColorConstants.appColor),
                decoration: InputDecoration(
                  hintStyle:
                      TextStyle(fontSize: 18, color: ColorConstants.appColor),
                  hintText: 'Search in MyPlaces',
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.all(15),
                ),
              )
            : Text(
                'MyPlaces',
                style: TextStyle(
                  color: ColorConstants.appBarTitleColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.add_circle_outline_outlined,
            ),
            onPressed: () async {
              await showSearch(
                context: context,
                delegate: LocationSearch(),
              ).then((value) {
                setState(() {});
              });
            },
          ),
        ],
      ),
      body: Container(
          color: Colors.white,
          child: Padding(
              padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
              child: isSearching
                  ? RefreshIndicator(
                      color: ColorConstants.appColor,
                      onRefresh: exitSearch,
                      child: ListView.builder(
                        itemBuilder: (context, index) => GestureDetector(
                          onTap: () {
                            viewDetails(searchResults[index].site);
                          },
                          child: Slidable(
                            actionPane: const SlidableDrawerActionPane(),
                            actionExtentRatio: 0.25,
                            actions: <Widget>[
                              IconSlideAction(
                                caption: 'Share',
                                color: Colors.transparent,
                                foregroundColor: ColorConstants.appColor,
                                icon: Icons.share_outlined,
                                onTap: () =>
                                    shareLocation(searchResults[index].site),
                              ),
                            ],
                            secondaryActions: <Widget>[
                              IconSlideAction(
                                caption: 'Remove',
                                color: Colors.red,
                                foregroundColor: ColorConstants.appColor,
                                icon: Icons.delete_outlined,
                                onTap: () {
                                  removeFromFavourites(
                                      searchResults[index].site);
                                },
                              ),
                            ],
                            child: Container(
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: pmToColor(
                                      searchResults[index]
                                          .pm2_5
                                          .calibratedValue),
                                  foregroundColor: Colors.black54,
                                  child: Center(
                                    child: Text(
                                      '${searchResults[index].getPm2_5Value().toStringAsFixed(2)}',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                          fontSize: 10.0,
                                          color: pmTextColor(
                                              searchResults[index]
                                                  .pm2_5
                                                  .calibratedValue)),
                                    ),
                                  ),
                                ),
                                title: Text(
                                    '${searchResults[index].site.getName()}',
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 17,
                                      color: ColorConstants.appColor,
                                      fontWeight: FontWeight.bold,
                                    )),
                                subtitle: Text(
                                    '${searchResults[index].site.getLocation()}',
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: ColorConstants.appColor,
                                    )),
                              ),
                            ),
                          ),
                        ),
                        itemCount: searchResults.length,
                      ),
                    )
                  : FutureBuilder(
                      future: DBHelper().getFavouritePlaces(),
                      builder: (context, snapshot) {
                        if (snapshot.hasData) {
                          results = snapshot.data as List<Measurement>;

                          if (results.isNotEmpty) {
                            searchList = results;
                          }

                          if (results.isEmpty) {
                            return Center(
                              child: Container(
                                padding: const EdgeInsets.all(16.0),
                                child: Text(
                                  'You haven\'t added any locations you'
                                  ' care about '
                                  'to MyPlaces yet, use the add icon at '
                                  'the top to add them to your list',
                                  softWrap: true,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: ColorConstants.appColor,
                                  ),
                                ),
                              ),
                            );
                          }

                          return RefreshIndicator(
                            color: ColorConstants.appColor,
                            onRefresh: refreshData,
                            child: ListView.builder(
                              itemBuilder: (context, index) => GestureDetector(
                                onTap: () {
                                  viewDetails(results[index].site);
                                },
                                child: Slidable(
                                  actionPane: const SlidableDrawerActionPane(),
                                  actionExtentRatio: 0.25,
                                  actions: <Widget>[
                                    IconSlideAction(
                                      caption: 'Share',
                                      color: Colors.transparent,
                                      foregroundColor: ColorConstants.appColor,
                                      icon: Icons.share_outlined,
                                      onTap: () =>
                                          shareLocation(results[index].site),
                                    ),
                                  ],
                                  secondaryActions: <Widget>[
                                    IconSlideAction(
                                      caption: 'Remove',
                                      color: Colors.transparent,
                                      foregroundColor: Colors.red,
                                      icon: Icons.delete_outlined,
                                      onTap: () {
                                        removeFromFavourites(
                                            results[index].site);
                                      },
                                    ),
                                  ],
                                  child: Container(
                                    child: ListTile(
                                      leading: CircleAvatar(
                                        backgroundColor: pmToColor(
                                            results[index].getPm2_5Value()),
                                        foregroundColor: pmTextColor(
                                            results[index].getPm2_5Value()),
                                        child: Center(
                                          child: Text(
                                            '${results[index].getPm2_5Value().toStringAsFixed(2)}',
                                            textAlign: TextAlign.center,
                                            style:
                                                const TextStyle(fontSize: 10.0),
                                          ),
                                        ),
                                      ),
                                      title: Text(
                                          '${results[index].site.getName()}',
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontSize: 17,
                                            color: ColorConstants.appColor,
                                            fontWeight: FontWeight.bold,
                                          )),
                                      subtitle: Text(
                                          '${results[index].site.getLocation()}',
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: ColorConstants.appColor,
                                          )),
                                    ),
                                  ),
                                ),
                              ),
                              itemCount: results.length,
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
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: FloatingActionButton(
        // isExtended: true,
        backgroundColor: ColorConstants.appColor,
        onPressed: () {
          setState(() {
            if (isSearching) {
              setState(() {
                isSearching = false;
                searchController.clear();
                searchResults.clear();
              });
            } else {
              setState(() {
                isSearching = true;
                searchController.clear();
                searchResults.clear();
              });
            }
          });
        },
        // isExtended: true,
        child: const Icon(Icons.search_outlined),
      ),
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
                results = value;
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
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return PlaceDetailsPage(site: site);
    })).then((value) {
      setState(() {});
    });
  }
}
