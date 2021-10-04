import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/site.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import 'add_alert_page.dart';

class AlertPage extends StatefulWidget {
  const AlertPage({Key? key}) : super(key: key);

  @override
  _AlertPageState createState() => _AlertPageState();
}

class _AlertPageState extends State<AlertPage> {
  var alerts = <Measurement>[];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: ColorConstants.appBarBgColor,
        leading: BackButton(color: ColorConstants.appColor),
        elevation: 0.0,
        title: Text(
          'Alerts ',
          style: TextStyle(
            color: ColorConstants.appBarTitleColor,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Container(
          color: ColorConstants.appBarBgColor,
          child: Center(
            child: Padding(
                padding: const EdgeInsets.all(6),
                child: alerts.isEmpty
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          FaIcon(
                            FontAwesomeIcons.bellSlash,
                            color: ColorConstants.appColor,
                            size: 60,
                          ),
                          const SizedBox(
                            height: 20,
                          ),
                          const Text(
                            'Empty in Alerts',
                            softWrap: true,
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 20),
                          ),
                          const SizedBox(
                            height: 10,
                          ),
                          const Text(
                            'Set alerts for the '
                            'air quality of your places.',
                            softWrap: true,
                            textAlign: TextAlign.center,
                          ),
                        ],
                      )
                    : RefreshIndicator(
                        color: ColorConstants.appColor,
                        onRefresh: refreshData,
                        child: ListView.builder(
                          itemBuilder: (context, index) => GestureDetector(
                            onTap: () {
                              viewAlert(alerts[index].site);
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
                                      shareLocation(alerts[index].site),
                                ),
                              ],
                              secondaryActions: <Widget>[
                                IconSlideAction(
                                  caption: 'Remove',
                                  color: Colors.transparent,
                                  foregroundColor: Colors.red,
                                  icon: Icons.delete_outlined,
                                  onTap: () {
                                    removeFromAlerts(alerts[index].site);
                                  },
                                ),
                              ],
                              child: Container(
                                child: ListTile(
                                  leading: CircleAvatar(
                                    backgroundColor: pmToColor(
                                        alerts[index].getPm2_5Value()),
                                    foregroundColor: pmTextColor(
                                        alerts[index].getPm2_5Value()),
                                    child: Center(
                                      child: Text(
                                        '${alerts[index].getPm2_5Value().toStringAsFixed(2)}',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(fontSize: 10.0),
                                      ),
                                    ),
                                  ),
                                  title: Text('${alerts[index].site.getName()}',
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 17,
                                        color: ColorConstants.appColor,
                                        fontWeight: FontWeight.bold,
                                      )),
                                  subtitle: Text(
                                      '${alerts[index].site.getLocation()}',
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: ColorConstants.appColor,
                                      )),
                                ),
                              ),
                            ),
                          ),
                          itemCount: alerts.length,
                        ),
                      )),
          )),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: FloatingActionButton(
        backgroundColor: ColorConstants.appColor,
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute<void>(
              builder: (BuildContext context) => AddAlertPage(),
              fullscreenDialog: true,
            ),
          );
        },
        child: const FaIcon(
          FontAwesomeIcons.plus,
          color: Colors.white,
        ),
      ),
    );
  }

  Future<void> refreshData() async {
    await DBHelper().getFavouritePlaces().then((value) => {
          if (mounted)
            {
              setState(() {
                alerts = value;
              })
            }
        });
  }

  Future<void> removeFromAlerts(Site site) async {
    await DBHelper().updateFavouritePlaces(site).then((value) => {
          showSnackBar(context, '${site.getName()} is removed from your places')
        });

    if (mounted) {
      setState(() {});
    }
  }

  Future<void> viewAlert(Site site) async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return PlaceDetailsPage(site: site);
    })).then((value) {
      setState(() {});
    });
  }
}
