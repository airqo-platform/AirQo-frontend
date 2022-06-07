import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../services/app_service.dart';
import '../../services/hive_service.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_widgets.dart';
import 'kya_widgets.dart';

class KnowYourAirView extends StatefulWidget {
  const KnowYourAirView({
    Key? key,
  }) : super(key: key);

  @override
  _KnowYourAirViewState createState() => _KnowYourAirViewState();
}

class _KnowYourAirViewState extends State<KnowYourAirView> {
  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: CustomColors.appBodyColor,
      child: ValueListenableBuilder<Box>(
        valueListenable: Hive.box<Kya>(HiveBox.kya).listenable(),
        builder: (context, box, widget) {
          if (box.isEmpty) {
            return const EmptyKya();
          }

          final kyaCards = box.values.toList().cast<Kya>();

          return AppRefreshIndicator(
            sliverChildDelegate: SliverChildBuilderDelegate(
              (context, index) {
                return Padding(
                  padding: EdgeInsets.only(
                    top: Config.refreshIndicatorPadding(
                      index,
                    ),
                  ),
                  child: KyaViewWidget(
                    kya: kyaCards[index],
                  ),
                );
              },
              childCount: kyaCards.length,
            ),
            onRefresh: _refreshKya,
          );
        },
      ),
    );
  }

  Future<void> _refreshKya() async {
    await _appService.refreshKyaView(context);
  }
}
