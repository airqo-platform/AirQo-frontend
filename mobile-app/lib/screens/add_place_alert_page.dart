import 'package:app/constants/app_constants.dart';
import 'package:app/models/alert.dart';
import 'package:app/models/site.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class AddPlaceAlertPage extends StatefulWidget {
  final Site site;

  AddPlaceAlertPage({Key? key, required this.site}) : super(key: key);

  @override
  _AddPlaceAlertPageState createState() => _AddPlaceAlertPageState();
}

class _AddPlaceAlertPageState extends State<AddPlaceAlertPage> {
  var _alertType = AlertType.fixedDaily;
  var _isSaving = false;
  var _airQuality = AirQuality.good;
  TimeOfDay _selectedTime = const TimeOfDay(hour: 8, minute: 00);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: ColorConstants.appBarBgColor,
        leading: BackButton(color: ColorConstants.appColor),
        elevation: 0.0,
        title: Text(
          'Alerts ',
          style: TextStyle(
            color: ColorConstants.appBarTitleColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        automaticallyImplyLeading: false,
        centerTitle: true,
      ),
      body: Container(
        color: ColorConstants.appBodyColor,
        child: ListView(
          children: <Widget>[
            Text(
              '${widget.site.getName()}',
              softWrap: true,
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
            ListTile(
              title: Row(
                children: [
                  Radio(
                    value: AlertType.fixedDaily,
                    groupValue: _alertType,
                    onChanged: (value) {
                      setState(() {
                        _alertType = value as AlertType;
                      });
                    },
                  ),
                  Text(
                    'Daily at '
                    '${getTime(_selectedTime.hour)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  )
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(right: 40, left: 20),
                child: OutlinedButton(
                  onPressed: () {
                    if (_alertType == AlertType.fixedDaily) {
                      return _selectTime();
                    }
                    return null;
                  },
                  // style: OutlinedButton.styleFrom(
                  //   shape: const CircleBorder(),
                  //   padding: const EdgeInsets.all(24),
                  // ),
                  child: Text(
                    'Change time',
                    style: TextStyle(color: ColorConstants.appColor),
                  ),
                ),
              ),
            ),
            ListTile(
              title: Row(
                children: [
                  Radio(
                    value: AlertType.custom,
                    groupValue: _alertType,
                    onChanged: (value) {
                      setState(() {
                        _alertType = value as AlertType;
                      });
                    },
                  ),
                  const Text('When air quality is ;',
                      softWrap: true,
                      maxLines: 2,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ))
                ],
              ),
              subtitle: Column(
                children: [
                  Row(
                    children: [
                      const SizedBox(
                        width: 50,
                      ),
                      const Text(
                        'Good',
                        softWrap: true,
                        maxLines: 2,
                      ),
                      const Spacer(),
                      Radio(
                        value: AirQuality.good,
                        groupValue: _airQuality,
                        onChanged: (value) {
                          if (_alertType == AlertType.custom) {
                            setState(() {
                              _airQuality = value as AirQuality;
                            });
                          }
                        },
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      const SizedBox(
                        width: 50,
                      ),
                      const Text(
                        'Moderate',
                        softWrap: true,
                        maxLines: 2,
                      ),
                      const Spacer(),
                      Radio(
                        value: AirQuality.moderate,
                        groupValue: _airQuality,
                        onChanged: (value) {
                          if (_alertType == AlertType.custom) {
                            setState(() {
                              _airQuality = value as AirQuality;
                            });
                          }
                        },
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      const SizedBox(
                        width: 50,
                      ),
                      const Text(
                        'Unhealthy for sensitive \ngroups',
                        softWrap: true,
                        maxLines: 2,
                      ),
                      const Spacer(),
                      Radio(
                        value: AirQuality.ufsg,
                        groupValue: _airQuality,
                        onChanged: (value) {
                          if (_alertType == AlertType.custom) {
                            setState(() {
                              _airQuality = value as AirQuality;
                            });
                          }
                        },
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      const SizedBox(
                        width: 50,
                      ),
                      const Text(
                        'Unhealthy',
                        softWrap: true,
                        maxLines: 2,
                      ),
                      const Spacer(),
                      Radio(
                        value: AirQuality.unhealthy,
                        groupValue: _airQuality,
                        onChanged: (value) {
                          if (_alertType == AlertType.custom) {
                            setState(() {
                              _airQuality = value as AirQuality;
                            });
                          }
                        },
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      const SizedBox(
                        width: 50,
                      ),
                      const Text(
                        'Very Unhealthy',
                        softWrap: true,
                        maxLines: 2,
                      ),
                      const Spacer(),
                      Radio(
                        value: AirQuality.veryUnhealthy,
                        groupValue: _airQuality,
                        onChanged: (value) {
                          if (_alertType == AlertType.custom) {
                            setState(() {
                              _airQuality = value as AirQuality;
                            });
                          }
                        },
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      const SizedBox(
                        width: 50,
                      ),
                      const Text(
                        'Hazardous',
                        softWrap: true,
                        maxLines: 2,
                      ),
                      const Spacer(),
                      Radio(
                        value: AirQuality.hazardous,
                        groupValue: _airQuality,
                        onChanged: (value) {
                          if (_alertType == AlertType.custom) {
                            setState(() {
                              _airQuality = value as AirQuality;
                            });
                          }
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(right: 30),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  _isSaving
                      ? CircularProgressIndicator(
                          color: ColorConstants.appColor,
                          strokeWidth: 2,
                        )
                      : OutlinedButton(
                          onPressed: saveAlert,
                          child: Row(
                            children: [
                              Text(
                                'Save',
                                style: TextStyle(
                                    color: ColorConstants.appColor,
                                    fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(
                                width: 10,
                              ),
                              FaIcon(
                                FontAwesomeIcons.bell,
                                color: ColorConstants.appColor,
                                size: 20,
                              ),
                            ],
                          ),
                        )
                ],
              ),
            ),
            const SizedBox(
              height: 20,
            ),
          ],
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _isSaving = false;
  }

  Future<void> saveAlert() async {
    Alert alert;

    setState(() {
      _isSaving = true;
    });

    var token = await NotificationService().getToken();
    if (token != null) {
      alert = Alert(
          token,
          widget.site.id,
          _alertType.getString(),
          _selectedTime.hour - DateTime.now().timeZoneOffset.inHours,
          _airQuality.getString(),
          widget.site.getName());
      var saved = await CloudStore().saveAlert(alert);

      if (saved) {
        await showSnackBar(
            context,
            'Alerts for ${widget.site.getName()} '
            'have been set');

        setState(() {
          _isSaving = false;
        });

        await DBHelper().addAlert(alert);
        Navigator.pop(context, true);
      } else {
        await showSnackBar(
            context,
            'Sorry, we couldn\'t save your alert.'
            ' Check your internet connection and try again.');
      }
    } else {
      await showSnackBar(
          context,
          'Sorry, we couldn\'t save your alert.'
          ' Try again later');
    }

    setState(() {
      _isSaving = false;
    });
  }

  void _selectTime() async {
    final newTime = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (newTime != null) {
      setState(() {
        _selectedTime = newTime;
      });
      print(_selectedTime.hour);
    }
  }
}
