import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../services/app_service.dart';
import '../../widgets/custom_widgets.dart';
import 'kya_widgets.dart';

class KnowYourAirView extends StatefulWidget {
  const KnowYourAirView({Key? key}) : super(key: key);

  @override
  _KnowYourAirViewState createState() => _KnowYourAirViewState();
}

class _KnowYourAirViewState extends State<KnowYourAirView> {
  List<Kya> _kyaCards = [];
  final AppService _appService = AppService();
  final String _error = 'You haven\'t completed any lessons';

  @override
  Widget build(BuildContext context) {
    return Container(
        color: Config.appBodyColor,
        child: _kyaCards.isEmpty
            ? Center(
                child: Text(_error),
              )
            : AppRefreshIndicator(
                sliverChildDelegate:
                    SliverChildBuilderDelegate((context, index) {
                  return Padding(
                      padding: EdgeInsets.only(
                          top: Config.refreshIndicatorPadding(index)),
                      child: KyaViewWidget(kya: _kyaCards[index]));
                }, childCount: _kyaCards.length),
                onRefresh: _refreshKya));
  }

  @override
  void initState() {
    super.initState();
    _loadKya();
    _initListeners();
  }

  void _loadKya() {
    setState(() =>
        _kyaCards = Hive.box<Kya>(HiveBox.kya).values.toList().cast<Kya>());
  }

  Future<void> _initListeners() async {
    Hive.box<Kya>(HiveBox.kya)
        .watch()
        .listen((_) => _loadKya())
        .onDone(_loadKya);
  }

  Future<void> _refreshKya() async {
    await _appService.refreshKyaView(context);
  }
}
