import 'package:app/constants/app_constants.dart';
import 'package:app/utils/date.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import 'maps_view.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({Key? key}) : super(key: key);

  @override
  _ProfileViewState createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {

  @override
  Widget build(BuildContext context) {
    return Container(
        color: ColorConstants.appBodyColor,
        child: RefreshIndicator(
            onRefresh: initialize,
            color: ColorConstants.appColor,
            child: Padding(
              padding: EdgeInsets.fromLTRB(16.0, 37, 16.0, 16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[

                  Expanded(
                    child: ListView(
                      shrinkWrap: true,
                      children: <Widget>[
                        Padding(
                          padding:
                          const EdgeInsets.fromLTRB(0.0, 0.0, 0.0, 0.0),
                          child: topBar(),
                        ),
                        Padding(
                          padding:
                          const EdgeInsets.fromLTRB(0.0, 10.0, 0.0, 0.0),
                          child: Text(
                            'Guest',
                            style: const TextStyle(
                                fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                        ),
                        Padding(
                          padding:
                          const EdgeInsets.fromLTRB(0.0, 16.0, 0.0, 0.0),
                          child: signupSection(),
                        ),

                        SizedBox(height: 16,),
                        settingsSection(),

                      ],
                    ),
                  ),
                ],
              ),
            )));
  }


  @override
  void initState() {
    // initialize();
    super.initState();
  }

  Widget topTabs() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        OutlinedButton(
            onPressed: (){},
            child: Text('Favourite')),
        SizedBox(width: 16,),
        OutlinedButton(
            onPressed: (){},
            child: Text('Favourite')),

      ],
    );

  }

  Widget tabs() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Container(
          padding: EdgeInsets.all(8.0),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(5.0))
          ),

          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Your Inflated tires could lead air pollution lead air pollution lead air pollution',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  )
              )

            ],
          ),
        ),
        SizedBox(width: 16,),
        OutlinedButton(
            onPressed: (){},
            child: Text('Favourite')),

      ],
    );

  }

  Widget topBar() {
    return Container(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [


          Stack(
            alignment: AlignmentDirectional.center,
            children: [
              RotationTransition(
                  turns: AlwaysStoppedAnimation(-5 / 360),
                  child: Container(
                    padding: EdgeInsets.all(2.0),
                    decoration: BoxDecoration(
                        color: ColorConstants.appPicColor,
                        shape: BoxShape.rectangle,
                        borderRadius: BorderRadius.all(Radius.circular(20.0))
                    ),
                    child: IconButton(
                      iconSize: 30,
                      icon: Icon(
                        Icons.search,
                        color: Colors.transparent,
                      ),
                      onPressed: () async {

                      },
                    ),
                  ),
              ),
              Text('NG',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 15
                ),
              )
              // Positioned(
              //     child: Text('hi'))

            ],
          ),
          Spacer(),
          Container(
            padding: EdgeInsets.all(2.0),
            decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(Radius.circular(10.0))
            ),
            child: IconButton(
              iconSize: 30,
              icon: Icon(
                Icons.notifications_rounded,
                color: ColorConstants.appBarTitleColor,
              ),
              onPressed: () async {

              },
            ),
          )
        ],
      ),
    );

  }



  Widget settingsSection() {
    return Container(
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(10.0))
      ),

      child: ListTile(
        leading: CustomUserAvatar(),
        title: const Text(
          'Settings',
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
              fontSize: 16
          ),
        ),
      ),
    );

  }


  Widget signupSection() {
    return Container(
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(10.0))
      ),

      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
              padding: EdgeInsets.fromLTRB(48.0, 38.0, 48.0, 0.0),
            child: Text('Personalise your \nexperience',
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                )
            ),
          ),
          Padding(
            padding: EdgeInsets.only(left: 48.0, right: 48.0),
            child: Text('Create your account today and enjoy air quality'
                ' updates and recommendations.',
                maxLines: 6,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                )
            ),
          ),
          SizedBox(height: 16,),
          Padding(
            padding: EdgeInsets.only(left: 24, right: 24, bottom: 38),
            child:           Container(
              constraints:
              const BoxConstraints(minWidth: double.infinity),
              decoration: BoxDecoration(
                  color: ColorConstants.appColorBlue,
                  borderRadius: BorderRadius.all(Radius.circular(10.0))
              ),
              child: Tab(
                  child: Text(
                    'Sign up',
                    style: TextStyle(
                      color: Colors.white,
                    ),
                  )
              ),
            ),
          ),



        ],
      ),
    );

  }

  Future<void> initialize() async {}
}
