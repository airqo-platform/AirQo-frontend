#!/bin/bash
flutter clean
rm -rf ios/Pods
rm -rf ios/.symlinks
rm ios/Podfile.lock
rm pubspec.lock
flutter pub add firebase_core shared_preferences google_maps_flutter json_annotation http
flutter pub add geolocator flutter_local_notifications path_provider animations provider
flutter pub add intl country_list_pick uuid flutter_svg image_picker
flutter pub add shimmer google_fonts in_app_review lottie
flutter pub add share_plus flutter_secure_storage geocoding flutter_dotenv auto_size_text
flutter pub add cached_network_image firebase_messaging cloud_firestore firebase_auth firebase_analytics
flutter pub add firebase_storage package_info_plus webview_flutter hive hive_flutter
flutter pub add firebase_in_app_messaging permission_handler workmanager flutter_cache_manager
flutter pub add path flutter_bloc equatable appinio_swiper firebase_dynamic_links
flutter pub add showcaseview url_launcher hydrated_bloc
cd ios || exit 1
pod repo update
pod install
exit 0