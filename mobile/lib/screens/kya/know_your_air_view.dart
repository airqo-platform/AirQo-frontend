import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:flutter/material.dart';

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
  String _error = 'You haven\'t completed any lessons';

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
    _getKya();
  }

  Future<void> _getKya() async {
    var kya = await _appService.dbHelper.getKyas();

    if (kya.isEmpty) {
      setState(() {
        _kyaCards = [];
        _error = 'Connect retrieve Know Your Air lessons. Try again later';
      });
      return;
    }

    if (mounted) {
      setState(() {
        _kyaCards = kya;
      });
    }
  }

  Future<void> _refreshKya() async {
    await _appService.refreshKyaView(context).then((_) => _getKya());
  }
}
