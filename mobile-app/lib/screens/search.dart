import 'package:app/models/device.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:flutter/material.dart';


class SearchPage extends StatefulWidget {

  final String title = 'Search';

  @override
  _SearchPageState createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  TextEditingController editingController = TextEditingController();

  var dbDevices = <Device>[];
  var devices = <Device>[];
  var dbHelper = DBHelper();
  bool notFound = false;

  @override
  void initState() {
    notFound = false;
    getDevices();

    super.initState();
  }

  void updateLists(List<Device> results){
    setState(() {
      notFound = false;
      dbDevices.clear();
      devices.clear();
      dbDevices.addAll(results);
      devices.addAll(results);
    });

  }


  Future<void> getDevices() async {

    await  getDevicesLocally();

    var results = await AirqoApiClient(context).fetchDevices();
    if (results.isEmpty){
      await showSnackBar(context, 'Locations not available');
    }

    if(results.isNotEmpty){
      updateLists(results);
      await dbHelper.insertLatestDevices(results);
    }
  }

  Future<void> getDevicesLocally() async {

    var offlineDevices = await dbHelper.getLatestDevices();

    if(offlineDevices.isNotEmpty){

      updateLists(offlineDevices);

    }

  }


  @override
  void dispose() {
    editingController.dispose();
    super.dispose();
  }

  void filterSearchResults(String query) async {

    if(query.isNotEmpty) {
      var dummyListData = <Device>[];
      for(var device in dbDevices){
        if((device.description != null && device.description.contains(query)) ||
            (device.siteName != null && device.siteName.contains(query))) {
          dummyListData.add(device);
        }
      }

      setState(() {

        devices.clear();

        for(var device in dummyListData){
          devices.add(device);
        }
      });

      if(devices.isEmpty){
        notFound = true;
      }
      else{
        notFound = false;
      }
      return;

    } else {
      print(dbDevices.length);
      setState(() {
        devices.clear();
        for(var device in dbDevices){
          devices.add(device);
        }

      });
    }

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextFormField(
          controller: editingController,
          onChanged: (value) {
            print('Value changed');
            filterSearchResults(value);
          },
          cursorColor: Colors.white,
          style: const TextStyle(
            color: Colors.white,
          ),
          // autofocus: true,
          decoration: InputDecoration(
            hintText: 'Search',
            // labelText: 'Search',
            suffixIcon: IconButton(
              onPressed: (){

              },
              icon: const Icon(Icons.search),
            ),
          ),
        ),
        // title: TextFormField(
        //   onChanged: (value) {
        //     print('Value changed');
        //     filterSearchResults(value);
        //   },
        //   controller: editingController,
        //   decoration: const InputDecoration(
        //     labelText: 'Search',
        //     hintText: 'Search',
        //     suffixIcon: Icon(Icons.search),
        //   ),
        // ),
      ),
      body: Container(
        child: Column(
          children: <Widget>[
            // Padding(
            //   padding: const EdgeInsets.all(8.0),
            //   child: TextField(
            //     onChanged: (value) {
            //       print('Value changed');
            //       filterSearchResults(value);
            //     },
            //     controller: editingController,
            //     decoration: const InputDecoration(
            //         labelText: 'Search',
            //         hintText: 'Search',
            //         prefixIcon: Icon(Icons.search),
            //         border: OutlineInputBorder(
            //             borderRadius: BorderRadius.all(Radius.circular(25.0)))),
            //   ),
            // ),
            notFound ? const Padding(
              padding: EdgeInsets.all(8.0),
              child: Text('Not found'),
            ) : const Text(''),
            Expanded(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: devices.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text('${devices[index].siteName}'),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
