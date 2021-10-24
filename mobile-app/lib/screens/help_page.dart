import 'package:app/constants/app_constants.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/help/aqi_index.dart';
import 'package:app/widgets/help/pollutant.dart';
import 'package:flutter/material.dart';

class HelpPage extends StatelessWidget {
  final int initialIndex;

  const HelpPage({Key? key, required this.initialIndex}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      initialIndex: getInitialIndex(),
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          centerTitle: true,
          backgroundColor: ColorConstants.appBarBgColor,
          leading: BackButton(color: ColorConstants.appColor),
          elevation: 0,
          bottom: TabBar(
            isScrollable: false,
            indicatorColor: ColorConstants.appColor,
            tabs: [
              const Tab(
                  child: Text(
                'AQI',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
              )),
              Tab(child: pmTab('2.5')),
              Tab(child: pmTab('10')),
            ],
          ),
          title: Text(
            'Help Guides',
            style: TextStyle(
                color: ColorConstants.appBarTitleColor,
                fontWeight: FontWeight.bold),
          ),
        ),
        body: TabBarView(
          children: [
            AqiDialog(),
            PollutantDialog(pollutantDetails(PollutantConstant.pm2_5)),
            PollutantDialog(pollutantDetails(PollutantConstant.pm10)),
          ],
        ),
      ),
    );
  }

  int getInitialIndex() {
    if (initialIndex > 2 || initialIndex < 0) {
      return 0;
    }
    return initialIndex;
  }

  Material pmTab(String pm) {
    return Material(
      color: Colors.transparent,
      child: RichText(
        text: TextSpan(
          children: <TextSpan>[
            TextSpan(
              text: 'PM',
              style: TextStyle(
                fontSize: 17,
                color: ColorConstants.appColor,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextSpan(
              text: pm,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: ColorConstants.appColor,
              ),
            )
          ],
        ),
      ),
    );
  }
}
