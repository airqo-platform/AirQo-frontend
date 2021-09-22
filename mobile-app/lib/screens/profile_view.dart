import 'package:app/constants/app_constants.dart';
import 'package:app/utils/date.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

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
            child: Text('Personalise your experience',
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
            padding: EdgeInsets.fromLTRB(48.0, 0.0, 48.0, 48.0),
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

        ],
      ),
    );

  }

  Widget tipsSection() {
    return Container(
      padding: EdgeInsets.all(8.0),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(5.0))
      ),

      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              Text('Your Inflated tires could lead air pollution lead air pollution lead air pollution',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  )
              ),
              GestureDetector(
                onTap: (){
                },
                child: Text('Read full story',
                    style: TextStyle(
                      color: ColorConstants.appColorBlue,
                      fontSize: 8,
                    )
                ),
              ),

            ],
          ),),
          SizedBox(width: 17,),
          ClipRRect(
            borderRadius: BorderRadius.circular(5.0),
            child: CachedNetworkImage(
              width: 104,
              height: 56,
              fit: BoxFit.cover,
              placeholder: (context, url) => const SizedBox(
                height: 20.0,
                width: 20.0,
                child: Center(
                  child: CircularProgressIndicator(
                    strokeWidth: 4,
                  ),
                ),
              ),
              imageUrl: 'https://miro.medium.com/max/1400/1*Q3eBVHmv1uW4397gjwa_Fg.jpeg',
              errorWidget: (context, url, error) => Icon(
                Icons.error_outline,
                color: ColorConstants.red,
              ),
            ),
          ),

        ],
      ),
    );

  }

  Future<void> initialize() async {}
}
