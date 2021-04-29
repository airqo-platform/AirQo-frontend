import 'package:app/constants/app_constants.dart';
import 'package:app/models/place.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class LocationSearch extends SearchDelegate<Suggestion> {
  LocationSearch() {
    apiClient = GoogleSearchProvider(const Uuid().v4());
  }

  // final sessionToken = Uuid().v4();

  GoogleSearchProvider apiClient = GoogleSearchProvider('');

  String searchPlaceId = '';


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
        close(context, Suggestion(description: '', placeId: ''));
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return FutureBuilder(
      future: query == '' ? null : apiClient.fetchSuggestions(query),
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

          var results = snapshot.data as  List<Suggestion>;

          return ListView.builder(
            itemBuilder: (context, index) => ListTile(
              title:
              Text((results[index]).description),
              onTap: () {
                query = (results[index]).description;
                print('Search ID 1 ${results[index].placeId}');
                searchPlaceId = results[index].placeId;
                showResults(context);
                // close(context, results[index]);
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

    if(query == ''){
      return Container(
        padding: const EdgeInsets.all(16.0),
        child: const Text('Enter your location'),
      );
    }


    if(searchPlaceId == ''){
      return Container(
        padding: const EdgeInsets.all(16.0),
        child: const Text('Place Id is null'),
      );
      // return FutureBuilder(
      //
      //     future: query == '' ? null : apiClient.fetchSuggestions(query),
      //     builder: (context, snapshot) {
      //
      //       if(query == ''){
      //         return Container(
      //           padding: const EdgeInsets.all(16.0),
      //           child: const Text('Enter your address'),
      //         );
      //       }
      //
      //       else if (snapshot.hasData){
      //
      //         var results = snapshot.data as  List<Suggestion>;
      //
      //         return ListView.builder(
      //           itemBuilder: (context, index) => ListTile(
      //             title:
      //             Text((results[index]).description),
      //             onTap: () {
      //               close(context, results[index]);
      //             },
      //           ),
      //           itemCount: results.length,
      //         );
      //       }
      //
      //       else{
      //         return Container(
      //           padding: const EdgeInsets.all(16.0),
      //           child: const Text('Loading...'),
      //         );
      //       }
      //     }
      //
      // );
    }


    print('Search ID 2 $searchPlaceId');
    return FutureBuilder(

        future: apiClient.getPlaceDetailFromId(searchPlaceId),
        builder: (context, snapshot) {

          if (snapshot.hasError){

            return Container(
              padding: const EdgeInsets.all(16.0),
              child: Text('${snapshot.error.toString()}'),
            );
          }

          else if (snapshot.hasData){

            var results = snapshot.data as  Place;

            return ListView.builder(
              itemBuilder: (context, index) => ListTile(
                title:
                Text(results.name),
                onTap: () {
                  // close(context, results[index]);
                  Navigator.push(context,
                      MaterialPageRoute(builder: (context) {
                        return PlaceDetailsPage();
                      }));
                },
              ),
              itemCount: 1,
            );
          }

          else{

            return Container(
              padding: const EdgeInsets.all(16.0),
              child: const Text('Loading location details. Please wait...'),
            );
          }
        }

    );

  }
}

