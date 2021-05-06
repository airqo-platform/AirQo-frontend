import 'package:app/models/measurement.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/widgets/air_quality_nav.dart';
import 'package:flutter/material.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {

  var results;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
        child: FutureBuilder(
            future: DBHelper().getFavouritePlaces(),
            builder: (context, snapshot) {

              if (snapshot.hasData){

                results = snapshot.data as List<Measurement>;

                if(results.isEmpty){
                  return Center(
                    child: Container(
                      padding: const EdgeInsets.all(16.0),
                      child: const Text('You haven\'t added '
                          'favourite places place, '
                          'search and add to your list...',
                        softWrap: true,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );

                }

                return RefreshIndicator(
                  onRefresh: refreshData,
                  child: ListView.builder(
                    itemBuilder: (context, index) =>
                        AirQualityCard(data: results[index]),
                    itemCount: results.length,
                  ),

                );
              }

              else{
                return const Center(child: CircularProgressIndicator(),);
                // return Center( child: Container(
                //   padding: const EdgeInsets.all(16.0),
                //   child: const Text('Loading...'),
                // ));
              }
            })
      )
    );
  }

  Future<void> refreshData() async {

    var data =  DBHelper().getFavouritePlaces();

    setState(() {
      results = data;
    });
  }

}


