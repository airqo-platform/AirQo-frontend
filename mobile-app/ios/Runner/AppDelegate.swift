import UIKit
import Flutter
import GoogleMaps

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {

      var config: [String: Any]?
      if let envPlistPath = Bundle.main.url(forResource: "env", withExtension: "plist") {
          do {
              let envPlistData = try Data(contentsOf: envPlistPath)

              if let dict = try PropertyListSerialization.propertyList(from: envPlistData, options: [], format: nil) as? [String: Any] {
                  config = dict
              }
          } catch {
              print(error)
          }
      }

//     print(config)
    GMSServices.provideAPIKey("config?['GoogleMapsKey']")
    GeneratedPluginRegistrant.register(with: self)
    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self as? UNUserNotificationCenterDelegate
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
