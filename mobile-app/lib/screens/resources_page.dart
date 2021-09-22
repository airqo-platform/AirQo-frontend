import 'package:app/constants/app_constants.dart';
import 'package:app/models/story.dart';
import 'package:app/screens/story_page.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ResourcesPage extends StatefulWidget {
  @override
  _ResourcesPageState createState() => _ResourcesPageState();
}

class _ResourcesPageState extends State<ResourcesPage> {
  var stories = <Story>[];

  @override
  Widget build(BuildContext context) {
    if (stories.isEmpty) {
      return Container(
        color: Colors.white,
        child: Center(
          child: CircularProgressIndicator(
            color: ColorConstants.appColor,
          ),
        ),
      );
    } else {
      return Container(
        color: Colors.white,
        child: RefreshIndicator(
          onRefresh: refresh,
          child: ListView.builder(
            itemBuilder: (context, index) => GestureDetector(
              onTap: () {
                viewStory(stories[index]);
              },
              child: ListTile(
                trailing: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: CachedNetworkImage(
                    width: 100,
                    height: 100,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => const SizedBox(
                      height: 20.0,
                      width: 20.0,
                      child: Center(
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                        ),
                      ),
                    ),
                    imageUrl: stories[index].thumbnail,
                    errorWidget: (context, url, error) => Icon(
                      Icons.error_outline,
                      color: ColorConstants.red,
                    ),
                  ),
                ),

                title: Text('${stories[index].title}',
                    overflow: TextOverflow.ellipsis,
                    maxLines: 3,
                    style: TextStyle(
                      fontSize: 15,
                      color: ColorConstants.appColor,
                      fontWeight: FontWeight.bold,
                    )),
                subtitle: Text('${stories[index].getPubDate()}',
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      color: ColorConstants.appColor,
                    )),
                // trailing: const Icon(
                //   Icons.arrow_forward_ios
                // ),
              ),
            ),
            itemCount: stories.length,
          ),
        )
      );
    }
  }

  void initialize() {
    DBHelper().getStories().then((value) => {
          if (mounted)
            {
              setState(() {
                stories = value;
              })
            }
        });

    AirqoApiClient(context).fetchLatestStories().then((value) => {
          if (mounted)
            {
              setState(() {
                stories = value;
              })
            },
          DBHelper().insertLatestStories(value)
        });
  }

  Future<void> refresh() async {
    await AirqoApiClient(context).fetchLatestStories().then((value) => {
      if (mounted)
        {
          setState(() {
            stories = value;
          })
        },
      DBHelper().insertLatestStories(value),
    });
  }


  @override
  void initState() {
    initialize();
    super.initState();
  }

  Future<void> viewStory(Story story) async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return StoryPage(
        story: story,
      );
    }));
  }
}
