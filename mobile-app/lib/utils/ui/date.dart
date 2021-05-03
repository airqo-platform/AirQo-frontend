import 'package:intl/intl.dart';

String dateToString(String formattedString){

  try{

    var date = DateFormat('EEE, MMM d, hh:mm a')
        .format(DateTime.parse(formattedString));

    return date;

  } on Error catch (e) {

    print('Date Formatting error: $e');
    return formattedString;

  }


}