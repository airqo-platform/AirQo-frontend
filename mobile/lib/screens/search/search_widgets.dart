import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../constants/config.dart';
import '../../models/measurement.dart';
import '../../models/suggestion.dart';
import '../../themes/light_theme.dart';
import '../../widgets/custom_widgets.dart';

class SearchPlaceTile extends StatelessWidget {
  final Suggestion searchSuggestion;
  const SearchPlaceTile({Key? key, required this.searchSuggestion})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 16.0, right: 30.0),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          border: Border.all(color: Colors.transparent)),
      child: ListTile(
          contentPadding: const EdgeInsets.only(left: 0.0),
          title: Text(
            searchSuggestion.suggestionDetails.getMainText(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.headline8(context),
          ),
          subtitle: Text(
            searchSuggestion.suggestionDetails.getSecondaryText(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.bodyText4(context)
                ?.copyWith(color: Config.appColorBlack.withOpacity(0.3)),
          ),
          trailing: SvgPicture.asset(
            'assets/icon/more_arrow.svg',
            semanticsLabel: 'more',
            height: 6.99,
            width: 4,
          ),
          leading: Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                  color: Config.appColorBlue.withOpacity(0.15),
                  shape: BoxShape.circle),
              child: Center(
                child: SvgPicture.asset('assets/icon/location.svg',
                    color: Config.appColorBlue),
              ))),
    );
  }
}

class SearchInputField extends StatelessWidget {
  final TextEditingController textEditingController;
  final Function(String) searchChanged;
  const SearchInputField(
      {Key? key,
      required this.textEditingController,
      required this.searchChanged})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      constraints: const BoxConstraints(minWidth: double.maxFinite),
      decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
      child: TextFormField(
        controller: textEditingController,
        onChanged: searchChanged,
        style: Theme.of(context).textTheme.caption?.copyWith(
              fontSize: 16,
            ),
        enableSuggestions: true,
        cursorWidth: 1,
        autofocus: false,
        cursorColor: Config.appColorBlack,
        decoration: InputDecoration(
          fillColor: Colors.white,
          prefixIcon: Padding(
            padding:
                const EdgeInsets.only(right: 7, top: 7, bottom: 7, left: 7),
            child: SvgPicture.asset(
              'assets/icon/search.svg',
              height: 14.38,
              width: 14.38,
              semanticsLabel: 'Search',
            ),
          ),
          contentPadding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
          focusedBorder: OutlineInputBorder(
            borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
            borderRadius: BorderRadius.circular(8.0),
          ),
          enabledBorder: OutlineInputBorder(
            borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
            borderRadius: BorderRadius.circular(8.0),
          ),
          border: OutlineInputBorder(
              borderSide:
                  const BorderSide(color: Colors.transparent, width: 1.0),
              borderRadius: BorderRadius.circular(8.0)),
          hintText: 'Search locations',
          hintStyle: Theme.of(context).textTheme.caption?.copyWith(
                color: Config.appColorBlack.withOpacity(0.32),
                fontSize: 14,
                fontWeight: FontWeight.w400,
              ),
        ),
      ),
    );
  }
}

class NoNearbyLocations extends StatelessWidget {
  const NoNearbyLocations({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(40.0),
          decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.rectangle,
              borderRadius: BorderRadius.all(Radius.circular(10.0))),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(
                height: 84,
              ),
              Stack(
                children: [
                  Image.asset(
                    'assets/images/world-map.png',
                    height: 130,
                    width: 130,
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: Config.appColorBlue,
                      shape: BoxShape.circle,
                    ),
                    child: const Padding(
                      padding: EdgeInsets.all(12.0),
                      child: Icon(
                        Icons.map_outlined,
                        size: 30,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(
                height: 52,
              ),
              const Text(
                'You don\'t have nearby air quality stations',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(
                height: 40,
              ),
            ],
          ),
        )
      ],
    );
  }
}

class SearchLocationTile extends StatelessWidget {
  final Measurement measurement;
  const SearchLocationTile({Key? key, required this.measurement})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 16.0, right: 30.0),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
          border: Border.all(color: Colors.transparent)),
      child: ListTile(
        contentPadding: const EdgeInsets.only(left: 0.0),
        title: AutoSizeText(
          measurement.site.name,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.headline8(context),
        ),
        subtitle: AutoSizeText(
          measurement.site.location,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.bodyText4(context)
              ?.copyWith(color: Config.appColorBlack.withOpacity(0.3)),
        ),
        trailing: SvgPicture.asset(
          'assets/icon/more_arrow.svg',
          semanticsLabel: 'more',
          height: 6.99,
          width: 4,
        ),
        leading: MiniAnalyticsAvatar(measurement: measurement),
      ),
    );
  }
}
