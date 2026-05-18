package com.airqo.app

import android.content.Intent
import android.os.Build
import android.util.Log
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {

    companion object {
        private const val CHANNEL = "com.airqo.app/location_service"
        private const val TAG = "MainActivity"
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "start" -> {
                        try {
                            val intent = Intent(this, LocationForegroundService::class.java).apply {
                                action = LocationForegroundService.ACTION_START
                                putExtra(
                                    LocationForegroundService.EXTRA_DISTINCT_ID,
                                    call.argument<String>("distinctId") ?: ""
                                )
                                // API key is read from BuildConfig inside the service — not passed here
                            }
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                startForegroundService(intent)
                            } else {
                                startService(intent)
                            }
                            result.success(null)
                        } catch (e: Exception) {
                            Log.w(TAG, "Could not start location foreground service", e)
                            result.error(
                                "LOCATION_SERVICE_START_FAILED",
                                e.message,
                                null
                            )
                        }
                    }
                    "stop" -> {
                        try {
                            startService(Intent(this, LocationForegroundService::class.java).apply {
                                action = LocationForegroundService.ACTION_STOP
                            })
                            result.success(null)
                        } catch (e: Exception) {
                            Log.w(TAG, "Could not stop location foreground service", e)
                            result.error(
                                "LOCATION_SERVICE_STOP_FAILED",
                                e.message,
                                null
                            )
                        }
                    }
                    else -> result.notImplemented()
                }
            }
    }
}
