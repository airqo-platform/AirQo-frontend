import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/place.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class LocationSearch extends SearchDelegate<Device> {


  @override
  ThemeData appBarTheme(BuildContext context) {
    final base = ThemeData.light();
    return base.copyWith(
      primaryColor: appColor,

      // textTheme: base.textTheme.apply(
      //   bodyColor: Colors.pink,
      //   displayColor: Colors.white,
      // ),

      visualDensity: VisualDensity.adaptivePlatformDensity,
    );
  }

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        tooltip: 'Clear',
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
        },
      )
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      tooltip: 'Back',
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        var device;
        close(context, device);
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return FutureBuilder(
      future: query == '' ? null : AirqoApiClient(context).fetchDevices(),
      builder: (context, snapshot) {

        if(query == ''){
          return Container(
            padding: const EdgeInsets.all(16.0),
            child: const Text('Enter your location'),
          );
        }

        if (snapshot.hasError){

          return Container(
            padding: const EdgeInsets.all(16.0),
            child: Text('${snapshot.error.toString()
                .replaceAll('Exception: ', '')}'),
          );
        }

        else if (snapshot.hasData){

          print(snapshot.data);

          var results = snapshot.data as  List<Device>;

          return ListView.builder(
            itemBuilder: (context, index) => ListTile(
              title:
              Text((results[index]).siteName),
              onTap: () {
                query = (results[index]).description;
                // showResults(context);
                close(context, results[index]);
              },
            ),
            itemCount: results.length,
          );
        }

        else{
          return Container(
            padding: const EdgeInsets.all(16.0),
            child: const Text('Loading...'),
          );
        }
      },


    );
  }

  @override
  Widget buildResults(BuildContext context) {

    return const Placeholder();

  }


  // @override
  // PreferredSizeWidget buildBottom(BuildContext context) {
  //
  //   return PreferredSize(
  //     preferredSize: const Size.fromHeight(40.0),
  //     child: Container(
  //
  //       padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
  //       decoration: const BoxDecoration(
  //         color: Colors.white,
  //         // gradient: LinearGradient(
  //         //   colors: [Colors.blue, Colors.pink],
  //         // ),
  //       ),
  //       child: Row(
  //         mainAxisAlignment: MainAxisAlignment.spaceEvenly,
  //         children: [
  //           SingleChildScrollView(
  //               scrollDirection: Axis.horizontal,
  //               child: Container(
  //                 width: 1000,
  //                 padding: EdgeInsets.all(8),
  //                 child: ListView(
  //                   scrollDirection: Axis.horizontal,
  //                   children: [
  //                     ElevatedButton(
  //                       style: ElevatedButton.styleFrom(
  //                           primary: appColor
  //                       ),
  //                       onPressed: () {
  //
  //                       },
  //                       child: const Text('Places'),
  //                     ),
  //                     ElevatedButton(
  //                       style: ElevatedButton.styleFrom(
  //                           primary: appColor
  //                       ),
  //                       onPressed: () {
  //
  //                       },
  //                       child: const Text('News'),
  //                     ),
  //                   ],
  //                 ),
  //               )
  //           ),
  //
  //         ],
  //       ),
  //     ),
  //   );
  //
  // }
}

