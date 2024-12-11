import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';

abstract class KyaRepository extends BaseRepository {
  Future<LessonResponseModel> fetchLessons();
}

class KyaImpl extends KyaRepository {
  @override
  Future<LessonResponseModel> fetchLessons() async {
    Response response = await createGetRequest(
        ApiUtils.fetchLessons, {"token": dotenv.env['AIRQO_API_TOKEN']!});

    LessonResponseModel lessonResponseModel =
        lessonResponseModelFromJson(response.body);

    return lessonResponseModel;
  }
}
