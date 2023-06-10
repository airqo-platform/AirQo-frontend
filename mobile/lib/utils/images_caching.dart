import 'package:flutter_cache_manager/flutter_cache_manager.dart';

void precacheImages(List<String> imageUrls) {
  for (String url in imageUrls) {
    try {
      DefaultCacheManager().downloadFile(url);
    } catch (e) {
      print(e);
    }
  }
}
