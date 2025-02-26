import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class LocationDisplayWidget extends StatelessWidget {
  final String title;
  final String subTitle;
  const LocationDisplayWidget(
      {super.key, required this.title, required this.subTitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          CircleAvatar(
              backgroundColor: Theme.of(context).brightness == Brightness.dark
                  ? Color(0xff3E4147)
                  : Theme.of(context).highlightColor,
              child: Center(
                child:
                    SvgPicture.asset("assets/images/shared/location_pin.svg"),
              )),
          SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                subTitle,
                style: TextStyle(
                    fontSize: 18,
                    color: Color(0xff7A7F87),
                    fontWeight: FontWeight.w500),
              ),
              SizedBox(width: 4),
              Text(
                title,
                maxLines: 1,
                softWrap: true,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    fontSize: 14,
                    color: Color(0xff7A7F87),
                    fontWeight: FontWeight.w500),
              )
            ],
          )
        ],
      ),
    );
  }
}
