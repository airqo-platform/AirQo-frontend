
import 'package:airqo/src/app/shared/repository/hive_repository.dart';

class AuthHelper {
  static Future<String?> getCurrentUserId() async {
    return HiveRepository.getData(HiveBoxNames.authBox, "userId");
  }
  
  static Future<String?> getAuthToken() async {
    return HiveRepository.getData(HiveBoxNames.authBox, "token");
  }
}