import 'package:airqo/src/app/profile/models/profile_response_model.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:http/http.dart';

abstract class UserRepository extends BaseRepository {
  Future<ProfileResponseModel> loadUserProfile();
}

class UserImpl extends UserRepository {
  @override
  Future<ProfileResponseModel> loadUserProfile() async {
    final userId = await HiveRepository.getData("userId", HiveBoxNames.authBox);

    if (userId == null) {
      throw Exception("User ID not found");
    }

    Response profileResponse =
        await createAuthenticatedGetRequest("/api/v2/users/${userId}", {});

    ProfileResponseModel model =
        profileResponseModelFromJson(profileResponse.body);
    return model;
  }
}
