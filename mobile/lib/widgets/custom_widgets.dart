import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:flutter/material.dart';

Widget backButton(context) {
  return Container(
    padding: EdgeInsets.all(0.0),
    decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))),
    child: IconButton(
      icon: Icon(
        Icons.arrow_back,
        color: Colors.black,
      ),
      onPressed: () {
        Navigator.pop(context);
      },
    ),
  );
}

Widget customInputField(context, text) {
  return Container(
    constraints: const BoxConstraints(minWidth: double.infinity),
    padding: EdgeInsets.only(left: 16.0, right: 8.0),
    decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))),
    child: Row(
      children: [
        Text('$text'),
        Spacer(),
        IconButton(
          icon: Icon(
            Icons.edit,
            color: ColorConstants.appColorBlue,
          ),
          onPressed: () {},
        )
      ],
    ),
  );
}

Widget customSearchField(context, text) {
  return Container(
    constraints: const BoxConstraints(minWidth: double.maxFinite),
    decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))),
    child: Row(
      children: [
        IconButton(
          icon: const Icon(Icons.search),
          onPressed: () {},
        ),
        Expanded(
          child: TextFormField(
            maxLines: 1,
            autofocus: true,
            decoration: InputDecoration(
              hintText: '$text',
              border: InputBorder.none,
            ),
          ),
        ),
      ],
    ),
  );
}

Widget locationTile(context) {
  return ListTile(
    title: const Text(
      'Kisenyi',
      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
    ),
    subtitle: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Kawempe, Kampala, Uganda',
            style:
                TextStyle(color: ColorConstants.inactiveColor, fontSize: 12)),
        const SizedBox(
          height: 4,
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Container(
              width: 37,
              height: 12,
              // padding: const EdgeInsets.all(1.0),
              decoration: BoxDecoration(
                color: ColorConstants.green.withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(10.0)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    padding: const EdgeInsets.all(1.0),
                    decoration: BoxDecoration(
                      color: ColorConstants.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  SizedBox(
                    width: 2,
                  ),
                  Text('Good', style: TextStyle(fontSize: 6)),
                ],
              ),
            ),
            const SizedBox(
              width: 8,
            ),
            Container(
              width: 30,
              height: 12,
              // padding: const EdgeInsets.all(1.0),
              decoration: BoxDecoration(
                color: ColorConstants.green.withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(10.0)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    padding: const EdgeInsets.all(1.0),
                    decoration: BoxDecoration(
                      color: ColorConstants.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(
                    width: 2,
                  ),
                  const Text('40', style: TextStyle(fontSize: 6)),
                ],
              ),
            ),
            Spacer()
          ],
        )
      ],
    ),
    trailing: Padding(
      padding: EdgeInsets.all(10),
      child: Container(
        width: 40,
        height: 80,
        decoration: BoxDecoration(
            color: ColorConstants.appBodyColor,
            borderRadius: BorderRadius.all(Radius.circular(10.0))),
        child: IconButton(
          icon: Icon(
            Icons.arrow_forward_ios_rounded,
            color: Colors.black,
            size: 15,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
    ),
  );
}

Widget locationTileV2(Measurement measurement) {
  return ListTile(
    title: Text(
      '${measurement.site.getName()}',
      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
    ),
    subtitle: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('${measurement.site.getLocation()}',
            style:
                TextStyle(color: ColorConstants.inactiveColor, fontSize: 12)),
        const SizedBox(
          height: 4,
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Container(
              width: 37,
              height: 12,
              // padding: const EdgeInsets.all(1.0),
              decoration: BoxDecoration(
                color: ColorConstants.green.withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(10.0)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    padding: const EdgeInsets.all(1.0),
                    decoration: BoxDecoration(
                      color: ColorConstants.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  SizedBox(
                    width: 2,
                  ),
                  Text('Good', style: TextStyle(fontSize: 6)),
                ],
              ),
            ),
            const SizedBox(
              width: 8,
            ),
            Container(
              width: 30,
              height: 12,
              // padding: const EdgeInsets.all(1.0),
              decoration: BoxDecoration(
                color: ColorConstants.green.withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(10.0)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    padding: const EdgeInsets.all(1.0),
                    decoration: BoxDecoration(
                      color: ColorConstants.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(
                    width: 2,
                  ),
                  const Text('40', style: TextStyle(fontSize: 6)),
                ],
              ),
            ),
            Spacer()
          ],
        )
      ],
    ),
    trailing: Padding(
      padding: EdgeInsets.all(10),
      child: Container(
        width: 40,
        height: 80,
        decoration: BoxDecoration(
            color: ColorConstants.appBodyColor,
            borderRadius: BorderRadius.all(Radius.circular(10.0))),
        child: const Icon(
          Icons.arrow_forward_ios_rounded,
          color: Colors.black,
          size: 15,
        ),
      ),
    ),
  );
}
