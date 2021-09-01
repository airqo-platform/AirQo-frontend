import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/services/notifications.dart';
import 'package:app/widgets/change_language.dart';
import 'package:app/widgets/change_theme.dart';
import 'package:app/widgets/clear_app_data.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import 'my_places.dart';

class SettingsPage extends StatefulWidget {
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  Languages _language = Languages.English;
  bool _persistentNotification = false;
  bool _smartNotification = false;
  bool _pushNotification = false;
  bool _dailyReports = false;
  bool _weeklyReports = false;
  bool _monthlyReports = false;
  bool _morningForecast = false;
  bool _eveningForecast = false;
  Themes _theme = Themes.lightTheme;
  final Notifications _notifications = Notifications();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: Container(
          child: Column(
        children: [
          Expanded(
            child: ListView(
              // physics:  const BouncingScrollPhysics(
              //     parent: AlwaysScrollableScrollPhysics()
              // ),
              children: <Widget>[
                userPreferences(),
                Divider(
                  indent: 30,
                  endIndent: 30,
                  color: ColorConstants().appColor,
                ),
                notifications(),
                Divider(
                  indent: 30,
                  endIndent: 30,
                  color: ColorConstants().appColor,
                ),
                reports(),
                Divider(
                  indent: 30,
                  endIndent: 30,
                  color: ColorConstants().appColor,
                ),
                support(),
                footer()
              ],
            ),
          ),
          // footer()
        ],
      )),
    );
  }

  void cancelNotification(int id) {
    _notifications.cancelNotifications(id);
  }

  EdgeInsets containerPadding() {
    return const EdgeInsets.fromLTRB(10, 10, 10, 0);
  }

  Widget footer() {
    return Container(
      padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
      decoration: BoxDecoration(
          gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
            Colors.white.withOpacity(0.5),
            ColorConstants().appColor,
          ])),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          GestureDetector(
            onTap: () {
              _launchURL('airqo');
            },
            child: Image.asset(
              'assets/icon/airqo_logo.png',
              height: 50,
              width: 50,
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                  icon: FaIcon(
                    FontAwesomeIcons.facebook,
                    color: ColorConstants().facebookColor,
                  ),
                  onPressed: () {
                    _launchURL('facebook');
                  }),
              IconButton(
                  icon: FaIcon(
                    FontAwesomeIcons.twitter,
                    color: ColorConstants().twitterColor,
                  ),
                  onPressed: () {
                    _launchURL('twitter');
                  }),
              IconButton(
                  icon: FaIcon(
                    FontAwesomeIcons.youtube,
                    color: ColorConstants().youtubeColor,
                  ),
                  onPressed: () {
                    _launchURL('youtube');
                  }),
              IconButton(
                  icon: FaIcon(
                    FontAwesomeIcons.linkedin,
                    color: ColorConstants().linkedInColor,
                  ),
                  onPressed: () {
                    _launchURL('linkedin');
                  }),
            ],
          ),
          const Text(
            'v1.21.7',
            style: TextStyle(color: Colors.white),
          )
        ],
      ),
    );
  }

  TextStyle headerStyle() {
    return const TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 16,
    );
  }

  @override
  void initState() {
    loadPreferences();
    _notifications.initNotifications();
    super.initState();
  }

  Future<void> loadPreferences() async {
    var prefs = await SharedPreferences.getInstance();
    var theme = prefs.getString(PrefConstants().appTheme);
    print(theme);
    if (theme != null) {
      switch (theme) {
        case 'light':
          _theme = Themes.lightTheme;
          break;
        case 'dark':
          _theme = Themes.darkTheme;
          break;
        default:
          _theme = Themes.lightTheme;
          break;
      }
    }

    _language = Languages.English;
  }

  Widget notifications() {
    return Container(
      padding: containerPadding(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Notifications',
            style: headerStyle(),
          ),
          // ListTile(
          //   title: const Text('Persistent Notifications'),
          //   subtitle: const Text('Display persistent notifications '
          //       'in the notification tray'),
          //   trailing: Switch(
          //     value: _persistentNotification,
          //     activeColor: ColorConstants().appColor,
          //     activeTrackColor: ColorConstants().appColor.withOpacity(0.6),
          //     inactiveThumbColor: Colors.white,
          //     inactiveTrackColor: Colors.black12,
          //     onChanged: (bool value) {
          //       if(value){
          //         showNotification(persistentNotificationId);
          //       }
          //       else{
          //         cancelNotification(persistentNotificationId);
          //       }
          //       setState(() {
          //         _persistentNotification = value;
          //       });
          //     },
          //   ),
          // ),
          ListTile(
            title: const Text('Smart Notifications'),
            subtitle: const Text('Receive air pollution alerts and '
                'recommendations for your saved places'),
            trailing: Switch(
              value: _smartNotification,
              activeColor: ColorConstants().appColor,
              activeTrackColor: ColorConstants().appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
                if (value) {
                  showNotification(smartNotificationId);
                } else {
                  cancelNotification(smartNotificationId);
                }

                setState(() {
                  _smartNotification = value;
                });
              },
            ),
          ),
          ListTile(
            title: const Text('Push Notifications'),
            subtitle: const Text('Get notifications about new features and '
                'blog posts from the AirQo team'),
            trailing: Switch(
              value: _pushNotification,
              activeColor: ColorConstants().appColor,
              activeTrackColor: ColorConstants().appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
                if (value) {
                  showNotification(pushNotificationId);
                } else {
                  cancelNotification(pushNotificationId);
                }

                setState(() {
                  _pushNotification = value;
                });
              },
            ),
          ),
        ],
      ),
    );
  }

  void pushNotification() {
    _notifications.showOngoingNotification();
  }

  Widget reports() {
    return Container(
      padding: containerPadding(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Reports',
            style: headerStyle(),
          ),
          ListTile(
            title: const Text('Daily'),
            trailing: Switch(
              value: _dailyReports,
              activeColor: ColorConstants().appColor,
              activeTrackColor: ColorConstants().appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
                setState(() {
                  _dailyReports = value;
                });
              },
            ),
          ),
          ListTile(
            title: const Text('Weekly'),
            trailing: Switch(
              value: _weeklyReports,
              activeColor: ColorConstants().appColor,
              activeTrackColor: ColorConstants().appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
                setState(() {
                  _weeklyReports = value;
                });
              },
            ),
          ),
          ListTile(
            title: const Text('Monthly'),
            trailing: Switch(
              value: _monthlyReports,
              activeColor: ColorConstants().appColor,
              activeTrackColor: ColorConstants().appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
                setState(() {
                  _monthlyReports = value;
                });
              },
            ),
          ),
          ListTile(
            title: const Text('Today\'s Forecast'),
            subtitle: const Text('The day\'s forecast received at 6AM'),
            trailing: Switch(
              value: _morningForecast,
              activeColor: ColorConstants().appColor,
              activeTrackColor: ColorConstants().appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
                setState(() {
                  _morningForecast = value;
                });
              },
            ),
          ),
          ListTile(
            title: const Text('Tomorrow\'s Forecast'),
            subtitle: const Text('Tomorrow\'s forecast received at 8PM'),
            trailing: Switch(
              value: _eveningForecast,
              activeColor: ColorConstants().appColor,
              activeTrackColor: ColorConstants().appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
                setState(() {
                  _eveningForecast = value;
                });
              },
            ),
          )
        ],
      ),
    );
  }

  void showNotification(int id) {
    switch (id) {
      case persistentNotificationId:
        _notifications.showOngoingNotification();
        return;
      case progressNotificationId:
        _notifications.showProgressNotification();
        return;
      case smartNotificationId:
        _notifications.showSmartNotification();
        return;
      case pushNotificationId:
        _notifications.showPushNotification();
        return;
      default:
        return;
    }
  }

  Widget support() {
    return Container(
      padding: containerPadding(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Support',
            style: headerStyle(),
          ),
          InkWell(
            onTap: () {
              _launchURL('faqs');
            },
            child: ListTile(
              title: const Text('FAQs'),
              leading: Icon(
                Icons.help_outline_outlined,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              _launchURL('Contact Us');
            },
            child: ListTile(
              title: const Text('Contact Us'),
              leading: Icon(
                Icons.contact_support_outlined,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              _launchURL('terms');
            },
            child: ListTile(
              title: const Text('Terms of Use & Privacy Policy'),
              leading: Icon(
                Icons.description,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              _launchURL('About');
            },
            child: ListTile(
              title: const Text('About AirQo'),
              leading: Icon(
                Icons.info_outline_rounded,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              _launchURL('rate');
            },
            child: ListTile(
              title: const Text('Rate App'),
              leading: Icon(
                Icons.rate_review_outlined,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              _launchEmail('feedback');
            },
            child: ListTile(
              title: const Text('Feedback'),
              leading: Icon(
                Icons.feedback_outlined,
                color: ColorConstants().appColor,
              ),
              subtitle: const Text('Tell us which functionality is most '
                  'important to you and what you would like '
                  'to be improved in the app'),
            ),
          ),
        ],
      ),
    );
  }

  Widget userPreferences() {
    return Container(
      padding: containerPadding(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'User Preferences',
            style: headerStyle(),
          ),
          InkWell(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return const MyPlaces();
              }));
            },
            child: ListTile(
              title: const Text('Manage MyPlaces'),
              leading: Icon(
                Icons.favorite_outlined,
                color: ColorConstants().appColor,
              ),
              trailing: Icon(
                Icons.arrow_forward_ios_rounded,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              showDialog(
                  context: context,
                  builder: (context) {
                    return ChangeThemeDialog(
                      onValueChange: _onThemeValueChange,
                      initialValue: _theme,
                    );
                  });
            },
            child: ListTile(
              title: const Text('Appearance'),
              leading: FaIcon(
                FontAwesomeIcons.paintRoller,
                color: ColorConstants().appColor,
              ),
              trailing: Icon(
                Icons.arrow_forward_ios_rounded,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              showDialog(
                  context: context,
                  builder: (context) {
                    return ChangeLanguageDialog(
                      onValueChange: _onLanguageValueChange,
                      initialValue: _language,
                    );
                  });
            },
            child: ListTile(
              title: const Text('Language'),
              leading: FaIcon(
                FontAwesomeIcons.language,
                color: ColorConstants().appColor,
              ),
              trailing: Icon(
                Icons.arrow_forward_ios_rounded,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          // const ListTile(
          //   title: Text('System Permissions'),
          // ),
          InkWell(
            onTap: () {
              showDialog(
                  context: context,
                  builder: (context) {
                    return ClearAppDialog();
                  });
            },
            child: ListTile(
              title: const Text('Clear All Data'),
              leading: Icon(
                Icons.delete,
                color: ColorConstants().appColor,
              ),
              subtitle: const Text('Clear all saved data including saved '
                  'places and preferences'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _launchEmail(String action) async {
    action = action.trim().toLowerCase();

    switch (action) {
      case 'feedback':
        final _emailFeedbackUri = Uri(
                scheme: 'mailto',
                path: '${Links().feedbackEmail}',
                queryParameters: {'subject': 'Mobile\bApplication\bFeedback!'})
            .toString();

        await canLaunch(_emailFeedbackUri)
            ? await launch(_emailFeedbackUri)
            : throw 'Could not launch faqs, try opening $_emailFeedbackUri';
        return;
      default:
        return;
    }
  }


  Future<void> _launchURL(String page) async {
    page = page.trim().toLowerCase();

    try {
      switch (page) {
        case 'faqs':
          await canLaunch(Links().faqs)
              ? await launch(Links().faqs)
              : throw 'Could not launch faqs, try opening ${Links().faqs}';
          return;
        case 'about':
          await canLaunch(Links().about)
              ? await launch(Links().about)
              : throw 'Could not launch about, try opening ${Links().about}';
          return;
        case 'contact us':
          await canLaunch(Links().contactUs)
              ? await launch(Links().contactUs)
              : throw 'Could not launch contact us, try opening ${Links().contactUs}';
          return;
        case 'terms':
          await canLaunch(Links().terms)
              ? await launch(Links().terms)
              : throw 'Could not launch terms, try opening ${Links().terms}';
          return;
        case 'rate':
          if (Platform.isAndroid) {
            await canLaunch(Links().playStoreLink)
                ? await launch(Links().playStoreLink)
                : throw 'Could not launch rate us, try opening'
                ' ${Links().playStoreLink}';
          } else if (Platform.isIOS) {
            await canLaunch(Links().iOSLink)
                ? await launch(Links().iOSLink)
                : throw 'Could not launch rate us, try opening ${Links().iOSLink}';
          } else {
            await canLaunch(Links().playStoreLink)
                ? await launch(Links().playStoreLink)
                : throw 'Could not launch rate us, try opening'
                ' ${Links().playStoreLink}';
          }
          return;
        case 'facebook':
          await canLaunch(Links().facebook)
              ? await launch(Links().facebook)
              : throw 'Could not launch facebook, try opening ${Links().facebook}';
          return;
        case 'twitter':
          await canLaunch(Links().twitter)
              ? await launch(Links().twitter)
              : throw 'Could not launch twitter, try opening ${Links().twitter}';
          return;
        case 'linkedin':
          await canLaunch(Links().linkedin)
              ? await launch(Links().linkedin)
              : throw 'Could not launch linkedin, try opening ${Links().linkedin}';
          return;
        case 'youtube':
          await canLaunch(Links().youtube)
              ? await launch(Links().youtube)
              : throw 'Could not launch youtube, try opening ${Links().youtube}';
          return;
        case 'airqo':
          await canLaunch(Links().airqoWebsite)
              ? await launch(Links().airqoWebsite)
              : throw 'Could not launch airqo, try opening ${Links().airqoWebsite}';
          return;
        default:
          await canLaunch(Links().airqoWebsite)
              ? await launch(Links().airqoWebsite)
              : throw 'Could not launch airqo, try opening ${Links().airqoWebsite}';
          return;
      }
    } catch (e) {
      print(e);
    }
  }

  Future<void> _onLanguageValueChange(Languages value) async {
    setState(() {
      _language = value;
    });

    // var prefs = await SharedPreferences.getInstance();
    //
    // if(value == Themes.lightTheme){
    //   await prefs.setString(appTheme, 'light');
    // }
    // else{
    //   await prefs.setString(appTheme, 'dark');
    // }
  }

  Future<void> _onThemeValueChange(Themes value) async {
    setState(() {
      _theme = value;
    });

    var prefs = await SharedPreferences.getInstance();

    if (value == Themes.lightTheme) {
      await prefs.setString(PrefConstants().appTheme, 'light');
    } else {
      await prefs.setString(PrefConstants().appTheme, 'dark');
    }
  }
}
