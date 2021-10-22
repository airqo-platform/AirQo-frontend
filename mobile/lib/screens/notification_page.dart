import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({Key? key}) : super(key: key);

  @override
  _NotificationPageState createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  var favouritePlaces = <Measurement>[];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        elevation: 0,
        backgroundColor: ColorConstants.appBodyColor,
        leading: Padding(
          padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
          child: backButton(context),
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(color: Colors.black),
        ),
      ),
      body: Container(
          color: ColorConstants.appBodyColor,
          child: FutureBuilder(
              future: DBHelper().getLatestMeasurements(),
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  favouritePlaces = snapshot.data as List<Measurement>;

                  if (favouritePlaces.isEmpty) {
                    return Center(
                      child: Container(
                        padding:
                            const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                        child: Text(
                          'No notifications',
                          style: TextStyle(color: ColorConstants.appColor),
                        ),
                      ),
                    );
                  }

                  return RefreshIndicator(
                    color: ColorConstants.appColor,
                    onRefresh: refreshData,
                    child: ListView.builder(
                      itemBuilder: (context, index) => Padding(
                        padding: const EdgeInsets.fromLTRB(10, 5, 10, 5),
                        child: notificationCard(),
                      ),
                      itemCount: 5,
                    ),
                  );
                } else {
                  return ListView(
                    children: [
                      Padding(
                        padding:
                            const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                        child: loadingAnimation(115.0),
                      ),
                      Padding(
                        padding:
                            const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                        child: loadingAnimation(115.0),
                      ),
                      Padding(
                        padding:
                            const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                        child: loadingAnimation(115.0),
                      ),
                      Padding(
                        padding:
                            const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                        child: loadingAnimation(115.0),
                      ),
                      Padding(
                        padding:
                            const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                        child: loadingAnimation(115.0),
                      ),
                      Padding(
                        padding:
                            const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                        child: loadingAnimation(115.0),
                      ),
                      Padding(
                        padding:
                            const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                        child: loadingAnimation(115.0),
                      ),
                    ],
                  );
                }
              })),
    );
  }

  Widget notificationCard() {
    return Container(
      padding: const EdgeInsets.fromLTRB(8.0, 8.0, 8.0, 8.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(8.0))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Text('Check out the air quality in Bugolobi',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                )),
          ),
          const SizedBox(
            width: 16,
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(10.0),
            child: Image.asset(
              'assets/images/know-your-air.png',
              width: 104,
              height: 104,
              fit: BoxFit.cover,
            ),
          ),
        ],
      ),
    );
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
}
