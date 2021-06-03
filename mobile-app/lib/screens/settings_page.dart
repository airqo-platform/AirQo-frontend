import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/change_language.dart';
import 'package:app/widgets/change_theme.dart';
import 'package:app/widgets/clear_app_data.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
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

  @override
  void initState() {
    loadPreferences();
    super.initState();
  }

  void loadPreferences(){
    _theme = Themes.lightTheme;
    _language = Languages.English;
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: Container(
          child: Column(
            children: [
              Expanded(child: ListView(
                physics:  const BouncingScrollPhysics(
                    parent: AlwaysScrollableScrollPhysics()
                ),
                children: <Widget>[

                  userPreferences(),
                  const Divider(
                    indent: 30,
                    endIndent: 30,
                    color: appColor,
                  ),
                  notifications(),
                  const Divider(
                    indent: 30,
                    endIndent: 30,
                    color: appColor,
                  ),
                  reports(),
                  const Divider(
                    indent: 30,
                    endIndent: 30,
                    color: appColor,
                  ),
                  support(),

                ],
              ),),
              footer()
            ],
          )
      ),
    );
  }

  TextStyle headerStyle(){
    return const TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 16,
    );
  }

  EdgeInsets containerPadding(){
    return const EdgeInsets.fromLTRB(10, 10, 10, 0);
  }

  Widget userPreferences() {
    return Container(
      padding: containerPadding(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text('User Preferences',
            style: headerStyle(),),
          InkWell(
            onTap: (){
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return const MyPlaces();
              }));
            },
            child: const ListTile(
              title: Text('Manage MyPlaces'),
              leading: Icon(
                Icons.favorite_outlined,
                color: appColor,),
              trailing: Icon(
                Icons.arrow_forward_ios_rounded,
                color: appColor,),
            ),
          ),
          InkWell(
            onTap: (){

              showDialog(
                  context: context,
                builder: (context) {
                    return ChangeThemeDialog(
                      onValueChange: _onThemeValueChange,
                      initialValue: _theme,
                    );
              });
            },
            child: const ListTile(
              title: Text('Appearance'),
              leading: FaIcon(FontAwesomeIcons.paintRoller,
                color: linkedInColor,),
              trailing: Icon(
                Icons.arrow_forward_ios_rounded,
                color: appColor,),
            ),
          ),
          InkWell(
            onTap: (){
              showDialog(
                  context: context,
                  builder: (context) {
                    return ChangeLanguageDialog(
                      onValueChange: _onLanguageValueChange,
                      initialValue: _language,
                    );
                  });
            },
            child: const ListTile(
              title: Text('Language'),
              leading: FaIcon(FontAwesomeIcons.language,
                color: linkedInColor,),
              trailing: Icon(
                Icons.arrow_forward_ios_rounded,
                color: appColor,),
            ),
          ),
          // const ListTile(
          //   title: Text('System Permissions'),
          // ),
          InkWell(
            onTap: (){
              showDialog(
                  context: context,
                  builder: (context) {
                    return ClearAppDialog();
                  });
            },
            child: const ListTile(
              title: Text('Clear All Data'),
              leading: Icon(
                Icons.delete,
                color: appColor,),
              subtitle: Text('Clear all saved data including saved places and preferences'),
            ),
          ),

        ],
      ),
    );
  }

  Widget notifications() {
    return Container(
      padding: containerPadding(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text('Notifications',
            style: headerStyle(),),
          ListTile(
            title: const Text('Persistent Notifications'),
            subtitle: const Text('Display persistent notifications '
                'in the notification tray'),
            trailing: Switch(
              value: _persistentNotification,
              activeColor: appColor,
              activeTrackColor: appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
                setState(() {
                  _persistentNotification = value;
                });
              },
            ),
          ),
          ListTile(
            title: const Text('Smart Notifications'),
            subtitle: const Text('Receive air pollution alerts and '
                'recommendations for your saved places'),
            trailing: Switch(
              value: _smartNotification,
              activeColor: appColor,
              activeTrackColor: appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
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
              activeColor: appColor,
              activeTrackColor: appColor.withOpacity(0.6),
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.black12,
              onChanged: (bool value) {
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

  Widget reports() {
    return Container(
      padding: containerPadding(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text('Reports',
            style: headerStyle(),),
          ListTile(
            title: const Text('Daily'),
            trailing: Switch(
              value: _dailyReports,
              activeColor: appColor,
              activeTrackColor: appColor.withOpacity(0.6),
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
              activeColor: appColor,
              activeTrackColor: appColor.withOpacity(0.6),
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
              activeColor: appColor,
              activeTrackColor: appColor.withOpacity(0.6),
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
            subtitle: const Text('The day\'s forecast received at 7AM'),
            trailing: Switch(
              value: _morningForecast,
              activeColor: appColor,
              activeTrackColor: appColor.withOpacity(0.6),
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
            subtitle: const Text('Tomorrow\'s forecast received at 7PM'),
            trailing: Switch(
              value: _eveningForecast,
              activeColor: appColor,
              activeTrackColor: appColor.withOpacity(0.6),
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

  Widget support() {
    return Container(
      padding: containerPadding(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text('Support',
            style: headerStyle(),),

          InkWell(
            onTap: (){
              _launchURL('faqs');
            },
            child: const ListTile(
              title: Text('FAQs'),
              leading: Icon(
                Icons.help_outline_outlined,
                color: appColor,
              ),
            ),
          ),
          InkWell(
            onTap: (){
              _launchURL('Contact Us');
            },
            child: const ListTile(
              title: Text('Contact Us'),
              leading: Icon(
                Icons.contact_support_outlined,
                color: appColor,
              ),
            ),
          ),
          InkWell(
            onTap: (){
              _launchURL('terms');
            },
            child: const ListTile(
              title: Text('Terms of Use & Privacy Policy'),
              leading: Icon(
                Icons.description,
                color: appColor,
              ),
            ),
          ),
          InkWell(
            onTap: (){
              _launchURL('About');
            },
            child: const ListTile(
              title: Text('About AirQo'),
              leading: Icon(
                Icons.info_outline_rounded,
                color: appColor,
              ),
            ),
          ),
          InkWell(
            onTap: (){
              _launchURL('rate');
            },
            child: const ListTile(
              title: Text('Rate App'),
              leading: Icon(
                Icons.rate_review_outlined,
                color: appColor,
              ),
            ),
          ),
          InkWell(
            onTap: (){
              _launchEmail('feedback');
            },
            child: const ListTile(
              title: Text('Feedback'),
              leading: Icon(
                Icons.feedback_outlined,
                color: appColor,
              ),
              subtitle: Text('Tell us which functionality is most '
                  'important to you and what you would like '
                  'to be improved in the app'),
            ),
          ),
        ],
      ),
    );
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
                appColor,
              ])),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[

          GestureDetector(
            onTap: () { _launchURL('airqo'); },
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
                  icon: const FaIcon(
                    FontAwesomeIcons.facebook,
                    color: facebookColor,
                  ),
                  onPressed: () { _launchURL('facebook'); }
              ),

              IconButton(
                  icon: const FaIcon(
                    FontAwesomeIcons.twitter,
                    color: twitterColor,),
                  onPressed: () { _launchURL('twitter'); }
              ),

              IconButton(
                  icon: const FaIcon(FontAwesomeIcons.youtube,
                    color: youtubeColor,),
                  onPressed: () { _launchURL('youtube'); }
              ),

              IconButton(
                  icon: const FaIcon(FontAwesomeIcons.linkedin,
                    color: linkedInColor,),
                  onPressed: () { _launchURL('linkedin'); }
              ),

            ],
          ),

          const Text(
            'Version 1.0.0',
            style: TextStyle(
              color: Colors.white
            ),
          )
        ],
      ),
    );
  }

  Future<void> _launchEmail(String action) async {
    action = action.trim().toLowerCase();

    switch(action){
      case 'feedback':
        final _emailFeedbackUri = Uri(
            scheme: 'mailto',
            path: '$appFeedbackEmail',
            queryParameters: {
              'subject': 'Mobile\bApplication\bFeedback!'
            }
        ).toString();

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

    switch(page){
      case 'faqs':
        await canLaunch(faqs)
            ? await launch(faqs)
            : throw 'Could not launch faqs, try opening $faqs';
        return;
      case 'about':
        await canLaunch(about)
            ? await launch(about)
            : throw 'Could not launch about, try opening $about';
        return;
      case 'contact us':
        await canLaunch(contactUs)
            ? await launch(contactUs)
            : throw 'Could not launch contact us, try opening $contactUs';
        return;
      case 'terms':
        await canLaunch(terms)
            ? await launch(terms)
            : throw 'Could not launch terms, try opening $terms';
        return;
      case 'rate':
        if(Platform.isAndroid){
          await canLaunch(appPlayStoreLink)
              ? await launch(appPlayStoreLink)
              : throw 'Could not launch rate us, try opening $appPlayStoreLink';
        }
        else if(Platform.isIOS){
          await canLaunch(appIOSLink)
              ? await launch(appIOSLink)
              : throw 'Could not launch rate us, try opening $appIOSLink';
        }
        else{
          await canLaunch(appPlayStoreLink)
              ? await launch(appPlayStoreLink)
              : throw 'Could not launch rate us, try opening $appPlayStoreLink';
        }
        return;
      case 'facebook':
        await canLaunch(facebook)
            ? await launch(facebook)
            : throw 'Could not launch facebook, try opening $facebook';
        return;
      case 'twitter':
        await canLaunch(twitter)
            ? await launch(twitter)
            : throw 'Could not launch twitter, try opening $twitter';
        return;
      case 'linkedin':
        await canLaunch(linkedin)
            ? await launch(linkedin)
            : throw 'Could not launch linkedin, try opening $linkedin';
        return;
      case 'youtube':
        await canLaunch(youtube)
            ? await launch(youtube)
            : throw 'Could not launch youtube, try opening $youtube';
        return;
      case 'airqo':
        await canLaunch(appWebsite)
            ? await launch(appWebsite)
            : throw 'Could not launch airqo, try opening $appWebsite';
        return;
      default:
        await canLaunch(appWebsite)
            ? await launch(appWebsite)
            : throw 'Could not launch airqo, try opening $appWebsite';
        return;
    }
  }

  void _onThemeValueChange(Themes value) {
    setState(() {
      _theme = value;
    });
  }

  void _onLanguageValueChange(Languages value) {
    setState(() {
      _language = value;
    });
  }

}

