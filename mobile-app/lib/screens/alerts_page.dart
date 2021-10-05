import 'package:app/constants/app_constants.dart';
import 'package:app/models/alert.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/dialogs.dart';
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
  var alerts = <Alert>[];

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
                              viewAlert(alerts[index]);
                            },
                            child: Slidable(
                              actionPane: const SlidableDrawerActionPane(),
                              actionExtentRatio: 0.25,
                              // actions: [
                              //   IconSlideAction(
                              //     caption: 'Turn off',
                              //     color: Colors.transparent,
                              //     foregroundColor: Colors.red,
                              //     icon: Icons.notifications_off_outlined,
                              //     onTap: () {
                              //       removeFromAlerts(alerts[index]);
                              //     },
                              //   ),
                              // ],
                              secondaryActions: <Widget>[
                                IconSlideAction(
                                  caption: 'Delete',
                                  color: Colors.transparent,
                                  foregroundColor: Colors.red,
                                  icon: Icons.delete_outlined,
                                  onTap: () {
                                    removeFromAlerts(alerts[index]);
                                  },
                                ),
                              ],
                              child: Container(
                                child: ListTile(
                                  leading: FaIcon(
                                    FontAwesomeIcons.bell,
                                    color: ColorConstants.appColor,
                                    size: 20,
                                  ),
                                  title: Text('${alerts[index].siteName}',
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 17,
                                        color: ColorConstants.appColor,
                                        fontWeight: FontWeight.bold,
                                      )),
                                  subtitle:
                                      Text('${alerts[index].getAlertString()}',
                                          overflow: TextOverflow.ellipsis,
                                          maxLines: 2,
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
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (BuildContext context) => AddAlertPage(),
              fullscreenDialog: true,
            ),
          );
          if (result != null) {
            await refreshData();
          }
        },
        child: const FaIcon(
          FontAwesomeIcons.plus,
          color: Colors.white,
        ),
      ),
    );
  }

  @override
  void initState() {
    refreshData();
    super.initState();
  }

  Future<void> refreshData() async {
    await DBHelper().getAlerts().then((value) => {
          if (mounted)
            {
              setState(() {
                alerts = value;
              })
            }
        });
  }

  Future<void> removeFromAlerts(Alert alert) async {
    CloudStore().deleteAlert(alert);

    await DBHelper().deleteAlert(alert).then((value) => {
          showSnackBar(
              context,
              'Alerts for ${alert.siteName}'
              ' have been removed.')
        });

    if (mounted) {
      await refreshData();
    }
  }

  Future<void> viewAlert(Alert alert) async {
    // await Navigator.push(context, MaterialPageRoute(builder: (context) {
    //   return PlaceDetailsPage(site: site);
    // })).then((value) {
    //   setState(() {});
    // });
  }
}
