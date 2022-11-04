import 'package:app/models/kya.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../constants/constants.dart';
import 'kya_widgets.dart';

class KnowYourAirView extends StatefulWidget {
  const KnowYourAirView({super.key});

  @override
  State<KnowYourAirView> createState() => _KnowYourAirViewState();
}

class _KnowYourAirViewState extends State<KnowYourAirView> {
  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: CustomColors.appBodyColor,
      child: ValueListenableBuilder<Box<Kya>>(
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
