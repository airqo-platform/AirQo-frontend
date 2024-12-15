import Flutter
import UIKit
import GoogleMaps                                          // Add this import


@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)

    GMSServices.provideAPIKey("AIzaSyAGtjeiEUdsPg5_VLrs1X17nkroKMk5fUk")

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
