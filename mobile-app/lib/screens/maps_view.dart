import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/map.dart';
import 'package:flutter/material.dart';

class MapView extends StatefulWidget {
  const MapView({Key? key}) : super(key: key);

  @override
  _MapViewState createState() => _MapViewState();
}

class _MapViewState extends State<MapView> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: <Widget>[
          MapWidget(),
          DraggableScrollableSheet(
            initialChildSize: 0.18,
            minChildSize: 0.18,
            builder: (BuildContext context, ScrollController scrollController) {
              return SingleChildScrollView(
                controller: scrollController,
                child: ScrollViewContent(),
              );
            },
          ),
        ],
      ),
    );
  }
}


class SearchContainer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Container(
          height: 50,
          decoration: BoxDecoration(
              color: ColorConstants.appBodyColor,
              borderRadius: BorderRadius.circular(6)),
          child: Row(
            children: <Widget>[
              const Padding(padding: EdgeInsets.fromLTRB(10.0, 0, 0, 0),
                child: Icon(Icons.search),),

              CustomTextField(),

            ],
          ),
        ), ),
        const SizedBox(width: 8.0,),
        Container(
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
              color: ColorConstants.appBodyColor,
              borderRadius: const BorderRadius.all(Radius.circular(10.0))
          ),
          child: IconButton(
            iconSize: 30,
            icon: Icon(
              Icons.clear,
              color: ColorConstants.appBarTitleColor,
            ),
            onPressed: () async {

            },
          ),
        )

      ],
    );
  }
}

class CustomTextField extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: TextFormField(
        maxLines: 1,
        autofocus: true,
        decoration: const InputDecoration(
          contentPadding: EdgeInsets.all(8),
          hintText: '',
          border: InputBorder.none,
        ),
      ),
    );
  }
}

class ScrollViewContent extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
    child: Card(
      elevation: 12.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      margin: const EdgeInsets.all(0),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
        ),
        child: InnerContent(),
      ),
    ),);
  }
}

class InnerContent extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.all(16.0),
    child: Column(
      children: <Widget>[
        const SizedBox(height: 8),
        DraggingHandle(),
        const SizedBox(height: 16),
        SearchContainer(),
        const SizedBox(height: 16),
        RegionsList(),

      ],
    ));
  }
}

class DraggingHandle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 4,
      width: 32,
      decoration: BoxDecoration(color: Colors.grey[200],
          borderRadius: BorderRadius.circular(16)),
    );
  }
}

class CustomUserAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      width: 40,

      decoration: BoxDecoration(
          color: ColorConstants.appBodyColor,
        shape: BoxShape.circle
      ),
    );
  }
}

class RegionsList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      shrinkWrap: true,
      children: <Widget>[
        ListTile(
          leading: CustomUserAvatar(),
          title: const Text(
            'Central Region',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16
            ),
          ),
          subtitle: const Text(
            'Uganda',
            style: TextStyle(
                fontSize: 8
            ),
          ),
        ),
        const Divider(
        ),
        ListTile(
          leading: CustomUserAvatar(),
          title: const Text(
            'Western Region',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16
            ),
          ),
          subtitle: const Text(
            'Uganda',

            style: TextStyle(
                fontSize: 8
            ),
          ),
        ),
        const Divider(
        ),
        ListTile(
          leading: CustomUserAvatar(),
          title: const Text(
            'Eastern Region',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16
            ),
          ),
          subtitle: const Text(
            'Uganda',

            style: TextStyle(
                fontSize: 8
            ),
          ),
        ),
        const Divider(
        ),
        ListTile(
          leading: CustomUserAvatar(),
          title: const Text(
            'Northern Region',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16
            ),
          ),
          subtitle: const Text(
            'Uganda',

            style: TextStyle(
                fontSize: 8
            ),
          ),
        ),
      ],
    );
  }
}
