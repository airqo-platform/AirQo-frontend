import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:app/widgets/monthly_view.dart';
import 'package:app/widgets/weekly_view.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class PlaceView extends StatefulWidget {
  final Site site;

  const PlaceView(this.site, {Key? key}) : super(key: key);

  @override
  _PlaceViewState createState() => _PlaceViewState();
}

class _PlaceViewState extends State<PlaceView>
    with SingleTickerProviderStateMixin {
  TabController? _tabController;
  bool isWeekly = true;

  int segmentedControlValue = 0;

  int currentSegment = 0;

  Widget backButton() {
    return Container(
      constraints: const BoxConstraints(maxHeight: 32),
      padding: const EdgeInsets.all(0.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
      child: IconButton(
        icon: const Icon(
          Icons.arrow_back,
          color: Colors.black,
          size: 20,
        ),
        onPressed: () {
          Navigator.pop(context);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: ColorConstants.appBodyColor,
        leading: Padding(
          padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
          child: backButton(),
        ),
        title: Padding(
          padding: const EdgeInsets.only(top: 10, bottom: 10),
          child: Material(
            color: Colors.white,
            borderRadius: const BorderRadius.all(Radius.circular(7.0)),
            child: TabBar(
                controller: _tabController,
                indicatorColor: Colors.transparent,
                labelColor: Colors.transparent,
                unselectedLabelColor: Colors.transparent,
                labelPadding: const EdgeInsets.all(3.0),
                onTap: (value) {
                  if (value == 0) {
                    setState(() {
                      isWeekly = true;
                    });
                  } else {
                    setState(() {
                      isWeekly = false;
                    });
                  }
                },
                tabs: <Widget>[
                  Container(
                    constraints: const BoxConstraints(
                        minWidth: double.infinity, maxHeight: 32),
                    decoration: BoxDecoration(
                        color: isWeekly
                            ? ColorConstants.appColorBlue
                            : Colors.white,
                        borderRadius:
                            const BorderRadius.all(Radius.circular(5.0))),
                    child: Tab(
                        child: Text(
                      'Week',
                      style: TextStyle(
                        color: isWeekly ? Colors.white : Colors.black,
                      ),
                    )),
                  ),
                  Container(
                    constraints: const BoxConstraints(
                        minWidth: double.infinity, maxHeight: 32),
                    decoration: BoxDecoration(
                        color: isWeekly
                            ? Colors.white
                            : ColorConstants.appColorBlue,
                        borderRadius:
                            const BorderRadius.all(Radius.circular(5.0))),
                    child: Tab(
                        child: Text(
                      'Month',
                      style: TextStyle(
                        color: isWeekly ? Colors.black : Colors.white,
                      ),
                    )),
                  )
                ]),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: <Widget>[
          WeeklyView(widget.site),
          MonthlyView(widget.site),
        ],
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
    _tabController!.dispose();
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  void onValueChanged(int? newValue) {
    if (newValue != null) {
      setState(() {
        currentSegment = newValue;
      });
    }
  }
}
