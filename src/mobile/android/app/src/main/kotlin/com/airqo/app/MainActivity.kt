package com.airqo.app

import android.content.Intent
import android.os.Build
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {

    companion object {
        private const val CHANNEL = "com.airqo.app/location_service"
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "start" -> {
                        val intent = Intent(this, LocationForegroundService::class.java).apply {
                            action = LocationForegroundService.ACTION_START
                            putExtra(LocationForegroundService.EXTRA_DISTINCT_ID,
                                call.argument<String>("distinctId") ?: "")
                            // API key is read from BuildConfig inside the service — not passed here
                        }
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            startForegroundService(intent)
                        } else {
                            startService(intent)
                        }
                        result.success(null)
                    }
                    "stop" -> {
                        startService(Intent(this, LocationForegroundService::class.java).apply {
                            action = LocationForegroundService.ACTION_STOP
                        })
                        result.success(null)
                    }
                    else -> result.notImplemented()
                }
            }
    }
}
