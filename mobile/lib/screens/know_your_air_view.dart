import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import 'air_pollution_ways_page.dart';

class KnowYourAirView extends StatefulWidget {
  const KnowYourAirView({Key? key}) : super(key: key);

  @override
  _KnowYourAirViewState createState() => _KnowYourAirViewState();
}

class _KnowYourAirViewState extends State<KnowYourAirView> {
  List<Kya> _kyaCards = [];
  final CloudStore _cloudStore = CloudStore();
  final CustomAuth _customAuth = CustomAuth();
  String _error = 'You haven\'t completed any lessons';
  final DBHelper _dbHelper = DBHelper();

  @override
  Widget build(BuildContext context) {
    return getBuildWidget();
  }

  Widget getBuildWidget() {
    if (_kyaCards.isEmpty) {
      return Container(
          color: Config.appBodyColor,
          child: Center(
            child: Text(_error),
          ));
    }

    return Container(
        color: Config.appBodyColor,
        child: ListView.builder(
          itemBuilder: (context, index) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: kyaWidget(_kyaCards[index]),
          ),
          itemCount: _kyaCards.length,
        ));
  }

  @override
  void initState() {
    _getKya();
    super.initState();
  }

  Widget kyaWidget(Kya kya) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 8.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(16.0))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              children: [
                GestureDetector(
                  onTap: () async {
                    await Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                      return AirPollutionWaysPage(kya, false);
                    }));
                  },
                  child: Text(kya.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      )),
                ),
                const SizedBox(
                  height: 28,
                ),
                GestureDetector(
                  onTap: () async {
                    await Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                      return AirPollutionWaysPage(kya, false);
                    }));
                  },
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Text('Start reading',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            color: Config.appColorBlue,
                          )),
                      const SizedBox(
                        width: 6,
                      ),
                      Icon(
                        Icons.arrow_forward_ios_sharp,
                        size: 10,
                        color: Config.appColorBlue,
                      )
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(
            width: 16,
          ),
          GestureDetector(
              onTap: () async {
                await Navigator.push(context,
                    MaterialPageRoute(builder: (context) {
                  return AirPollutionWaysPage(kya, false);
                }));
              },
              child: Container(
                width: 104,
                height: 104,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  image: DecorationImage(
                    fit: BoxFit.cover,
                    image: CachedNetworkImageProvider(
                      kya.imageUrl,
                    ),
                  ),
                ),
              )),
        ],
      ),
    );
  }

  Future<void> _getKya() async {
    var dbKya = await _dbHelper.getKyas();
    var completeKya =
        dbKya.where((element) => element.progress >= 100).toList();

    if (mounted) {
      setState(() {
        _kyaCards = completeKya;
      });
    }

    var isConnected = await _cloudStore.isConnected();
    if (!isConnected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }

    if (!_customAuth.isLoggedIn()) {
      if (mounted) {
        setState(() {
          _error = 'You are not logged in. Please login or signup';
        });
      }
      return;
    }

    var kyaCards = await _cloudStore.getKya(_customAuth.getId());
    var completeKyaCards =
        kyaCards.where((element) => element.progress >= 100.0).toList();

    if (completeKyaCards.isNotEmpty && mounted) {
      setState(() {
        _kyaCards = completeKyaCards;
      });
    }

    await _dbHelper.insertKyas(kyaCards);
  }
}
