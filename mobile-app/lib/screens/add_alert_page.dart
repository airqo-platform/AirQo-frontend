import 'package:app/constants/app_constants.dart';
import 'package:app/models/alert.dart';
import 'package:app/models/measurement.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class AddAlertPage extends StatefulWidget {
  @override
  _AddAlertPageState createState() => _AddAlertPageState();
}

class _AddAlertPageState extends State<AddAlertPage> {
  int _currentStep = 0;
  var sites = <Measurement>[];
  var selectedSite;
  var _alertType = AlertType.fixedDaily;
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
        color: ColorConstants.appBarBgColor,
        child: Column(
          children: [
            Expanded(
              child: Stepper(
                type: StepperType.horizontal,
                // physics: const ScrollPhysics(),
                physics: const ClampingScrollPhysics(),
                controlsBuilder: (BuildContext context,
                    {VoidCallback? onStepContinue,
                    VoidCallback? onStepCancel}) {
                  return Row(
                    children: [],
                  );
                },
                currentStep: _currentStep,
                onStepTapped: tapped,
                onStepContinue: continued,
                onStepCancel: cancel,
                elevation: 0.0,
                steps: <Step>[
                  Step(
                    title: Text(
                      'Select a Place',
                      style: TextStyle(
                        color: ColorConstants.appColor,
                      ),
                    ),
                    content: Padding(
                      padding: EdgeInsets.only(bottom: 20),
                      child: ListView.builder(
                        shrinkWrap: true,
                        controller: ScrollController(),
                        itemBuilder: (BuildContext context, int index) {
                          return InkWell(
                              onTap: () {
                                setState(() {
                                  selectedSite = sites[index];
                                });
                                continued();
                              },
                              child: ListTile(
                                title: Text('${sites[index].site.getName()}',
                                    style: TextStyle(
                                      fontSize: 17,
                                      color: ColorConstants.appColor,
                                      fontWeight: FontWeight.bold,
                                    )),
                                subtitle:
                                    Text('${sites[index].site.getLocation()}',
                                        style: TextStyle(
                                          fontSize: 15,
                                          color: ColorConstants.appColor,
                                        )),
                                // leading: FaIcon(
                                //   FontAwesomeIcons.mapMarkerAlt,
                                //   color: ColorConstants.appColor,
                                // ),
                              ) //your content here
                              );
                        },
                        itemCount: sites.length,
                      ),
                    ),
                    isActive: _currentStep >= 0,
                    state: _currentStep >= 0
                        ? StepState.complete
                        : StepState.disabled,
                  ),
                  Step(
                    title: Text(
                      'Set Alert',
                      style: TextStyle(
                        color: ColorConstants.appColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    content: ListView(
                      shrinkWrap: true,
                      controller: ScrollController(),
                      children: <Widget>[
                        if (selectedSite != null)
                          Text(
                            '${selectedSite.site.getName()}',
                            softWrap: true,
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 20),
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
                                style:
                                    TextStyle(color: ColorConstants.appColor),
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
                          // subtitle: Slider(
                          //   value: _currentSliderValue,
                          //   min: 0,
                          //   max: 100,
                          //   divisions: 5,
                          //   label: _currentSliderValue.round().toString(),
                          //   onChanged: (double value) {
                          //     setState(() {
                          //       _currentSliderValue = value;
                          //     });
                          //   },
                          // ),
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
                                  Spacer(),
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
                                  Spacer(),
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
                                  Spacer(),
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
                                  Spacer(),
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
                                  Spacer(),
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
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            OutlinedButton(
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
                        const SizedBox(
                          height: 20,
                        ),
                      ],
                    ),
                    isActive: _currentStep >= 0,
                    state: _currentStep >= 1
                        ? StepState.complete
                        : StepState.disabled,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void cancel() {
    _currentStep > 0 ? setState(() => _currentStep -= 1) : null;
  }

  void continued() {
    _currentStep < 1 ? setState(() => _currentStep += 1) : null;
  }

  void getSites() {
    DBHelper().getLatestMeasurements().then((value) => {
          if (value.isEmpty)
            {}
          else
            {
              setState(() {
                sites = value;
              })
            }
        });
  }

  @override
  void initState() {
    getSites();
    super.initState();
  }

  Future<void> saveAlert() async {
    Alert alert;

    var token = await NotificationService().getToken();
    if (token != null) {
      print(DateTime.now().timeZoneOffset.inHours);
      alert = Alert(
          token,
          selectedSite.site.id,
          _alertType.getString(),
          _selectedTime.hour - DateTime.now().timeZoneOffset.inHours,
          _airQuality.getString(),
          selectedSite.site.getName());
      var saved = CloudStore().saveAlert(alert);

      if (saved) {
        await showSnackBar(
            context,
            'Alerts for ${selectedSite.site.getName()} '
            'have been set');
        await DBHelper().addAlert(alert);
        Navigator.pop(context, true);
      } else {
        await showSnackBar(
            context,
            'Sorry, we couldn\'t save your alert.'
            ' Try again later');
      }
    } else {
      await showSnackBar(
          context,
          'Sorry, we couldn\'t save your alert.'
          ' Try again later');
    }
  }

  void tapped(int step) {
    setState(() => _currentStep = step);
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
