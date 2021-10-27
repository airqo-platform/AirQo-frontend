import 'package:app/constants/app_constants.dart';
import 'package:app/utils/string_extension.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';

class AirPollutionWaysPage extends StatefulWidget {
  const AirPollutionWaysPage({Key? key}) : super(key: key);

  @override
  _AirPollutionWaysPageState createState() => _AirPollutionWaysPageState();
}

class _AirPollutionWaysPageState extends State<AirPollutionWaysPage> {
  List<String> slides = [
    '',
    'Avoid burning rubbish',
    'Dispose of your rubbish properly',
    'Recycle and reuse',
    'Walk, cycle or use public transport',
    'Service your car or Boda boda regularly ',
    'Cut down on single-use plastic products',
    'Avoid idling your car engine in traffic',
    'Turn off the lights when not in use',
    'Use LED bulbs'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: knowYourAirAppBar(context, ''),
      body: Container(
        color: ColorConstants.appBodyColor,
        child: Column(children: [
          Container(
            height: 221,
            width: double.infinity,
            child: Image.asset(
              'assets/images/tips-image.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(
            height: 24,
          ),
          Expanded(
            child: Padding(
                padding: const EdgeInsets.only(left: 24, right: 24),
                child: MediaQuery.removePadding(
                    context: context,
                    removeTop: true,
                    child: ListView(
                      children: [
                        const Text(
                          'Together, let\'s reduce air '
                          'pollution to breathe clean!',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const Text(
                          'Here are 9 ways you can get involved'
                          ' and reduce air pollutions.',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 25),
                        ),
                        const SizedBox(
                          height: 16,
                        ),
                        Container(
                          padding:
                              const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 24.0),
                          decoration: BoxDecoration(
                              borderRadius:
                                  const BorderRadius.all(Radius.circular(8.0)),
                              color: Colors.white,
                              border: Border.all(color: Colors.transparent)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              textWidget(1, 'Avoid burning rubbish'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(2, 'Dispose of your rubbish properly'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(3, 'Recycle and reuse'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  4, 'Walk, cycle or use public transport'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  5, 'Service your car or Boda boda regularly'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  6, 'Cut down on single-use plastic products'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  7, 'Avoid idling your car engine in traffic'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  8, 'Turn off the lights when not in use'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(9, 'Use LED bulbs'),
                            ],
                          ),
                        )
                      ],
                    ))),
          ),
        ]),
      ),
    );
  }

  Widget slideHeadCard() {
    return Padding(
      padding: const EdgeInsets.only(left: 10, right: 10),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(8.0))),
        width: MediaQuery.of(context).size.width * 0.9,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/skate.png',
              height: 150,
            ),
            const Text(
              'Together, let\'s reduce '
              'air pollution to breathe clean!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
              ),
            ),
            Text(
                'Here are 9 ways you can get involved and reduce air pollutions'
                    .toTitleCase(),
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget textWidget(int index, String value) {
    return Text(
      '$index. $value',
      style: const TextStyle(fontSize: 14),
    );
  }
}
