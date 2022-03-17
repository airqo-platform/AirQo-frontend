import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../services/app_service.dart';
import '../../themes/light_theme.dart';
import 'kya_title_page.dart';

class KnowYourAirView extends StatefulWidget {
  const KnowYourAirView({Key? key}) : super(key: key);

  @override
  _KnowYourAirViewState createState() => _KnowYourAirViewState();
}

class _KnowYourAirViewState extends State<KnowYourAirView> {
  List<Kya> _kyaCards = [];
  late AppService _appService;
  String _error = 'You haven\'t completed any lessons';

  @override
  Widget build(BuildContext context) {
    return Container(
        color: Config.appBodyColor,
        child: RefreshIndicator(
          onRefresh: _refreshKya,
          child: _kyaCards.isEmpty
              ? Center(
                  child: Text(_error),
                )
              : ListView.builder(
                  itemBuilder: (context, index) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: kyaWidget(_kyaCards[index]),
                  ),
                  itemCount: _kyaCards.length,
                ),
        ));
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    _getKya();
  }

  Widget kyaWidget(Kya kya) {
    return GestureDetector(
        onTap: () async {
          await Navigator.push(context, MaterialPageRoute(builder: (context) {
            return KyaTitlePage(kya);
            // return MyHomePage();
          }));
        },
        child: Container(
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
                    AutoSizeText(
                      kya.title,
                      maxLines: 4,
                      overflow: TextOverflow.ellipsis,
                      style: CustomTextStyle.headline10(context),
                    ),
                    const SizedBox(
                      height: 28,
                    ),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        AutoSizeText('Start reading',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: CustomTextStyle.caption3(context)
                                ?.copyWith(color: Config.appColorBlue)),
                        const SizedBox(
                          width: 6,
                        ),
                        SvgPicture.asset(
                          'assets/icon/more_arrow.svg',
                          semanticsLabel: 'more',
                          height: 6.99,
                          width: 4,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(
                width: 16,
              ),
              Container(
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
              ),
            ],
          ),
        ));
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
    await _appService.fetchKya().then((_) => _getKya());
  }
}
