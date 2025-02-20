import Flutter
import UIKit
import GoogleMaps

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
           // Load API key from environment
        guard let filePath = Bundle.main.path(forResource: ".env.prod", ofType: nil) else {
            fatalError("Couldn't find .env file")
        }
        
        do {
            let contents = try String(contentsOfFile: filePath, encoding: .utf8)
            let envVars = parse(envFile: contents)
            
            guard let apiKey = envVars["GOOGLE_MAPS_API_KEY"] else {
                fatalError("Missing GOOGLE_MAPS_API_KEY in .env file")
            }
            
            GMSServices.provideAPIKey(apiKey)
            GeneratedPluginRegistrant.register(with: self)
            return super.application(application, didFinishLaunchingWithOptions: launchOptions)
        } catch {
            fatalError("Couldn't load .env file: \(error)")
        }
    }
    
    private func parse(envFile: String) -> [String: String] {
        var envVars: [String: String] = [:]
        
        let lines = envFile.components(separatedBy: .newlines)
        for line in lines {
            let parts = line.components(separatedBy: "=")
            if parts.count == 2 {
                let key = parts[0].trimmingCharacters(in: .whitespaces)
                let value = parts[1].trimmingCharacters(in: .whitespaces)
                    .replacingOccurrences(of: "\"", with: "")
                envVars[key] = value
            }
        }
        
        return envVars
    }
}