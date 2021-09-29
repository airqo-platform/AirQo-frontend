import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

Widget backButton(context){

  return Container(
    padding: EdgeInsets.all(0.0),
    decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))
    ),
    child: IconButton(
      icon:Icon(Icons.arrow_back, color: Colors.black,),
      onPressed: () {Navigator.pop(context);},
    ),
  );
}

Widget locationTile(context){

  return ListTile(
    title: Text('Kisenyi',
      style: TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 16
      ),
    ),
    subtitle: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Kawempe, Kampala, Uganda',
            style: TextStyle(
              color: ColorConstants.inactiveColor,
                fontSize: 12
            )),
        SizedBox(height: 4,),
        Row(
            crossAxisAlignment: CrossAxisAlignment.center,
       mainAxisAlignment: MainAxisAlignment.spaceEvenly,
       children: [
         Text('Good',
             style: TextStyle(
                 color: ColorConstants.green,
                 fontSize: 10
             )),
         SizedBox(width: 8,),
         Text('40',
             style: TextStyle(
                 color: ColorConstants.green,
                 fontSize: 10
             )),
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
            borderRadius: BorderRadius.all(Radius.circular(10.0))
        ),
        child: IconButton(
          icon:Icon(Icons.arrow_forward_ios_rounded,
            color: Colors.black, size: 15,),
          onPressed: () {Navigator.pop(context);},
        ),
      ),
    ),
  );
}

Widget customSearchField(context, text){

  return Container(
    constraints: const BoxConstraints(minWidth: double.maxFinite),
    decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))
    ),
    child: Row(
      children: [
        IconButton(
          icon:const Icon(Icons.search),
          onPressed: () { },
        ),
        Expanded(child: TextFormField(
          maxLines: 1,
          autofocus: true,
          decoration: InputDecoration(
            hintText: '$text',
            border: InputBorder.none,
          ),
        ),),

      ],
    ),
  );
}

Widget customInputField(context, text){

  return Container(
    constraints: const BoxConstraints(minWidth: double.infinity),
    padding: EdgeInsets.only(left: 16.0, right: 8.0),
    decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))
    ),
    child: Row(
      children: [
        Text('$text'),
        Spacer(),
        IconButton(
          icon:Icon(Icons.edit, color: ColorConstants.appColorBlue,),
          onPressed: () { },
        )
      ],
    ),
  );
}