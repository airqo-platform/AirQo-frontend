import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({Key? key}) : super(key: key);

  @override
  _SearchPageState createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 40),
        color: ColorConstants.appBodyColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: <Widget>[

                Padding(padding: const EdgeInsets.only(right: 16.0),
                  child:  backButton(context),
                ),
                Expanded(child: customSearchField(context,
                    'Search your village air quality'),)


              ],
            ),

            const SizedBox(height: 30,),
            Expanded(child: ListView(
              shrinkWrap: true,
              children: [
                RequestLocationAccess(),
                nearByLocations(),
              ],
            ),),


            
          ],
        ),
      ),
    );
  }

  Widget nearByLocations(){
    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Locations near me',
            textAlign: TextAlign.start,
            style: TextStyle(
                color: ColorConstants.inactiveColor,
                fontSize: 12
            ),
          ),
          const SizedBox(height: 8,),
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(Radius.circular(10.0))
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                locationTile(context),
                Divider(
                  color: ColorConstants.appBodyColor,
                ),
                locationTile(context),
                Divider(
                  color: ColorConstants.appBodyColor,
                ),
                locationTile(context),
                Divider(
                  color: ColorConstants.appBodyColor,
                ),
                locationTile(context),
                Divider(
                  color: ColorConstants.appBodyColor,
                ),
                locationTile(context)
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget RequestLocationAccess(){
    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Locations near me',
            textAlign: TextAlign.start,
            style: TextStyle(
              color: ColorConstants.inactiveColor,
              fontSize: 12
            ),
          ),
          const SizedBox(height: 8,),
          Container(
            padding: EdgeInsets.all(40.0),
            decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(Radius.circular(10.0))
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(height: 84,),
                Stack(
                  children: [
                    Image.asset(
                      'assets/images/world-map.png',
                      height: 130,
                      width: 130,
                    ),
                    Container(
                      decoration: BoxDecoration(
                          color: ColorConstants.appColorBlue,
                          shape: BoxShape.circle,
                      ),
                      child: const Padding(
                        padding: EdgeInsets.all(12.0),
                        child: Icon(
                          Icons.map_outlined, size: 30,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 52,),
                const Text('Enable locations',
                  textAlign: TextAlign.start,
                  style: TextStyle(
                      fontSize: 20,
                    fontWeight: FontWeight.bold
                  ),
                ),
                const SizedBox(height: 8,),
                const Text('Allow AirQo to show you location air '
                    'quality update near you.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 12
                  ),
                ),
                const SizedBox(height: 24,),
                Container(
                  constraints:
                  const BoxConstraints(minWidth: double.infinity),
                  decoration: BoxDecoration(
                      color: ColorConstants.appColorBlue,
                      borderRadius: BorderRadius.all(Radius.circular(10.0))
                  ),
                  child: Padding(
                    padding: EdgeInsets.only(top: 19, bottom: 19),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Allow locaton',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                          ),
                        )
                      ],
                    ),
                  )
                ),
                SizedBox(height: 40,),
              ],
            ),
          )
        ],
      ),
    );
  }
}
