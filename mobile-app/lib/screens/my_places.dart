import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/screens/search.dart';
import 'package:app/screens/search_location_page.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/utils/ui/pm.dart';
import 'package:app/utils/ui/share.dart';
import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';

class MyPlaces extends StatefulWidget {
  const MyPlaces({Key? key}) : super(key: key);

  @override
  _MyPlacesState createState() => _MyPlacesState();
}

class _MyPlacesState extends State<MyPlaces> {
  // List<Measurement> results;
  var results;
  var searchResults = [];
  var searchList = [];
  bool isSearching = false;
  TextEditingController searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: isSearching
              ? TextField(
                  autofocus: true,
                  controller: searchController,
                  onSubmitted: doSearch,
                  onChanged: doSearch,
                  onTap: () {},
                  style: const TextStyle(fontSize: 18, color: Colors.white),
                  decoration: const InputDecoration(
                    hintStyle: TextStyle(fontSize: 18, color: Colors.white),
                    hintText: 'Search',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.all(15),
                  ),
                )
              : const Text('MyPlaces'),
          actions: [
            IconButton(
              icon: const Icon(
                Icons.search_outlined,
              ),
              onPressed: () {
                if (isSearching) {
                  setState(() {
                    isSearching = false;
                  });
                } else {
                  setState(() {
                    isSearching = true;
                  });
                }
              },
            ),
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

                // Navigator.push(
                //   context,
                //   MaterialPageRoute(builder: (context) => SearchPage()),
                // );
              },
            ),
          ],
        ),
        body: Container(
            child: Padding(
                padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
                child: isSearching
                    ? ListView.builder(
                        itemBuilder: (context, index) => GestureDetector(
                          onTap: () {
                            viewDetails(searchResults[index].device);
                          },
                          child: Slidable(
                            actionPane: const SlidableDrawerActionPane(),
                            actionExtentRatio: 0.25,
                            actions: <Widget>[
                              IconSlideAction(
                                caption: 'Share',
                                color: appColor,
                                icon: Icons.share_outlined,
                                onTap: () => shareLocation(
                                    searchResults[index].device),
                              ),
                            ],
                            secondaryActions: <Widget>[
                              IconSlideAction(
                                caption: 'Remove',
                                color: ColorConstants().red,
                                icon: Icons.delete_outlined,
                                onTap: () {
                                  removeFromFavourites(
                                      searchResults[index].device);
                                },
                              ),
                            ],
                            child: Container(
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: pmToColor(
                                      searchResults[index].pm2_5.calibratedValue),
                                  foregroundColor: Colors.black54,
                                  child: Center(
                                    child: Text(
                                      '${searchResults[index].pm2_5.calibratedValue}',
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
                                  (searchResults[index].device.nickName != null &&
                                      searchResults[index].device.nickName != '')
                                      ? '${searchResults[index].device.nickName} '
                                      : '${searchResults[index].device.siteName}',
                                  overflow: TextOverflow.ellipsis,
                                ),
                                subtitle: Text(
                                  '${searchResults[index].device.locationName}',
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                          ),
                        ),
                        itemCount: searchResults.length,
                      )
                    : FutureBuilder(
                        future: DBHelper().getFavouritePlaces(),
                        builder: (context, snapshot) {
                          if (snapshot.hasData) {
                            results = snapshot.data as List<Measurement>;

                            if (searchList.isEmpty) {
                              searchList = snapshot.data as List<Measurement>;
                            }

                            if (results.isEmpty) {
                              return Center(
                                child: Container(
                                  padding: const EdgeInsets.all(16.0),
                                  child: const Text(
                                    'You haven\'t added any locations you care about '
                                    'to MyPlaces yet, use the add icon at '
                                    'the top to add them to your list',
                                    softWrap: true,
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: appColor,
                                    ),
                                  ),
                                ),
                              );
                            }

                            return RefreshIndicator(
                              onRefresh: refreshData,
                              child: ListView.builder(
                                itemBuilder: (context, index) =>
                                    GestureDetector(
                                  onTap: () {
                                    viewDetails(results[index].device);
                                  },
                                  child: Slidable(
                                    actionPane:
                                        const SlidableDrawerActionPane(),
                                    actionExtentRatio: 0.25,
                                    actions: <Widget>[
                                      IconSlideAction(
                                        caption: 'Share',
                                        color: appColor,
                                        icon: Icons.share_outlined,
                                        onTap: () => shareLocation(
                                            results[index].device),
                                      ),
                                    ],
                                    secondaryActions: <Widget>[
                                      IconSlideAction(
                                        caption: 'Remove',
                                        color: Colors.red,
                                        icon: Icons.delete_outlined,
                                        onTap: () {
                                          removeFromFavourites(
                                              results[index].device);
                                        },
                                      ),
                                    ],
                                    child: Container(
                                      child: ListTile(
                                        leading: CircleAvatar(
                                          backgroundColor: pmToColor(
                                              results[index].pm2_5.calibratedValue),
                                          foregroundColor: Colors.black54,
                                          child: Center(
                                            child: Text(
                                              '${results[index].pm2_5.calibratedValue}',
                                              textAlign: TextAlign.center,
                                              style: const TextStyle(
                                                  fontSize: 10.0),
                                            ),
                                          ),
                                        ),
                                        title: Text(
                                          (results[index].device.nickName != null &&
                                              results[index].device.nickName != '')
                                              ? '${results[index].device.nickName} '
                                              : '${results[index].device.siteName}',
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        subtitle: Text(
                                          '${results[index].device.locationName}',
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                itemCount: results.length,
                              ),
                            );
                          } else {
                            return const Center(
                              child: CircularProgressIndicator(
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(appColor),
                              ),
                            );
                          }
                        }))));
  }

  Future<void> refreshData() async {
    var data = DBHelper().getFavouritePlaces();

    setState(() {
      results = data;
    });
  }

  Future<void> removeFromFavourites(Device device) async {
    var place = await DBHelper().updateFavouritePlace(device, false);

    await showSnackBar2(
        context, '${place.siteName} is removed from your places');

    setState(() {});
  }

  void doSearch(String query) {
    query = query.toLowerCase();

    if (query.isNotEmpty) {
      searchResults.clear();
      var dummyListData = <Measurement>[];
      for (Measurement measurement in searchList) {
        var device = measurement.device;

        if ((device.description != null &&
                device.description.toLowerCase().contains(query)) ||
            (device.siteName != null &&
                device.siteName.toLowerCase().contains(query)) ||
            (device.locationName != null &&
                device.locationName.toLowerCase().contains(query)) ||
            (device.nickName != null &&
                device.nickName.toLowerCase().contains(query))) {
          dummyListData.add(measurement);
        }
      }

      for (var measurement in dummyListData) {
        setState(() {
          searchResults.add(measurement);
        });
      }

      return;
    } else {
      setState(() {});
    }
  }

  Future<void> viewDetails(Device device) async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return PlaceDetailsPage(device: device);
    })).then((value) {
      setState(() {});
    });
  }
}
