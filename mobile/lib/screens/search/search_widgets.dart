import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../models/enum_constants.dart';
import '../../models/measurement.dart';
import '../../models/place_details.dart';
import '../../models/suggestion.dart';
import '../../services/native_api.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_widgets.dart';
import '../insights/insights_page.dart';

class SearchPlaceTile extends StatelessWidget {
  const SearchPlaceTile({Key? key, required this.searchSuggestion})
      : super(key: key);
  final Suggestion searchSuggestion;

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
                ?.copyWith(color: CustomColors.appColorBlack.withOpacity(0.3)),
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
                  color: CustomColors.appColorBlue.withOpacity(0.15),
                  shape: BoxShape.circle),
              child: Center(
                child: SvgPicture.asset('assets/icon/location.svg',
                    color: CustomColors.appColorBlue),
              ))),
    );
  }
}

class SearchInputField extends StatelessWidget {
  const SearchInputField(
      {Key? key,
      required this.textEditingController,
      required this.searchChanged})
      : super(key: key);
  final TextEditingController textEditingController;
  final Function(String) searchChanged;

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
        cursorColor: CustomColors.appColorBlack,
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
                color: CustomColors.appColorBlack.withOpacity(0.32),
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
                      color: CustomColors.appColorBlue,
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
  const SearchLocationTile({Key? key, required this.measurement})
      : super(key: key);
  final Measurement measurement;

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
              ?.copyWith(color: CustomColors.appColorBlack.withOpacity(0.3)),
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

class RequestLocationAccess extends StatelessWidget {
  const RequestLocationAccess({Key? key, required this.getUserLocation})
      : super(key: key);

  final VoidCallback getUserLocation;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(40.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.all(Radius.circular(16.0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(
            height: 84,
          ),
          Stack(
            children: [
              Padding(
                padding: const EdgeInsets.only(left: 23),
                child: Image.asset(
                  'assets/images/world-map.png',
                  height: 119,
                  width: 119,
                ),
              ),
              Positioned(
                  left: 0,
                  top: 22,
                  child: Container(
                    height: 56,
                    width: 56,
                    decoration: BoxDecoration(
                      color: CustomColors.appColorBlue,
                      shape: BoxShape.circle,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: SvgPicture.asset(
                        'assets/icon/location.svg',
                        color: Colors.white,
                        semanticsLabel: 'AirQo Map',
                        height: 29,
                        width: 25,
                      ),
                    ),
                  )),
            ],
          ),
          const SizedBox(
            height: 24,
          ),
          Text(
            'Enable locations',
            textAlign: TextAlign.start,
            style: CustomTextStyle.headline7(context),
          ),
          const SizedBox(
            height: 8,
          ),
          Text(
            'Allow AirQo to show you location air '
            'quality update near you.',
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .subtitle2
                ?.copyWith(color: CustomColors.appColorBlack.withOpacity(0.4)),
          ),
          const SizedBox(
            height: 24,
          ),
          GestureDetector(
            onTap: () {
              PermissionService.checkPermission(AppPermission.location,
                      request: true)
                  .then((value) => {getUserLocation()});
            },
            child: Container(
                decoration: BoxDecoration(
                    color: CustomColors.appColorBlue,
                    borderRadius: const BorderRadius.all(Radius.circular(8.0))),
                child: const Padding(
                  padding: EdgeInsets.only(top: 12, bottom: 14),
                  child: Center(
                    child: Text(
                      'Allow location',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.normal,
                          fontSize: 14,
                          height: 22 / 14,
                          letterSpacing: 16 * -0.022),
                    ),
                  ),
                )),
          ),
          const SizedBox(
            height: 40,
          ),
        ],
      ),
    );
  }
}

class NearbyLocations extends StatelessWidget {
  const NearbyLocations({Key? key, required this.nearbyLocations})
      : super(key: key);

  final List<Measurement> nearbyLocations;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(
          height: 8.0,
        ),
        Container(
            padding: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
                color: CustomColors.appBodyColor,
                shape: BoxShape.rectangle,
                borderRadius: const BorderRadius.all(Radius.circular(10.0))),
            child: MediaQuery.removePadding(
                context: context,
                removeTop: true,
                child: ListView.builder(
                  controller: ScrollController(),
                  shrinkWrap: true,
                  itemBuilder: (context, index) => GestureDetector(
                      onTap: () {
                        Navigator.push(context,
                            MaterialPageRoute(builder: (context) {
                          return InsightsPage(PlaceDetails.siteToPLace(
                              nearbyLocations[index].site));
                        }));
                      },
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: SearchLocationTile(
                            measurement: nearbyLocations[index]),
                      )),
                  itemCount: nearbyLocations.length,
                ))),
      ],
    );
  }
}
