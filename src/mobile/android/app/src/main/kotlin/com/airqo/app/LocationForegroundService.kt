package com.airqo.app

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.FusedLocationProviderClient
import kotlinx.coroutines.*
import kotlinx.coroutines.tasks.await
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*

/**
 * Foreground service that fires a `location_ping` PostHog event every 20 minutes.
 * Keeps running while the app is backgrounded (e.g. during a commute).
 * Only needs ACCESS_FINE_LOCATION ("While using the app") — no background-location
 * permission required.
 */
class LocationForegroundService : Service() {

    companion object {
        private const val TAG = "LocationFgService"
        const val CHANNEL_ID = "airqo_research_location"
        const val NOTIFICATION_ID = 9001
        const val ACTION_START = "START"
        const val ACTION_STOP  = "STOP"
        const val EXTRA_DISTINCT_ID = "distinct_id"
        // API key is read from BuildConfig — never passed via Intent
        private const val INTERVAL_MS = 20 * 60 * 1000L // 20 minutes
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var fusedClient: FusedLocationProviderClient
    private var pingJob: Job? = null

    private var distinctId = ""
    // Read at build time from secrets.properties — never travels over Intent
    private val apiKey: String get() = BuildConfig.POSTHOG_API_KEY
    private val host:   String get() = BuildConfig.POSTHOG_HOST

    override fun onCreate() {
        super.onCreate()
        fusedClient = LocationServices.getFusedLocationProviderClient(this)
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                distinctId = intent.getStringExtra(EXTRA_DISTINCT_ID) ?: ""
                startForeground(NOTIFICATION_ID, buildNotification())
                schedulePings()
            }
            ACTION_STOP -> {
                pingJob?.cancel()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                } else {
                    @Suppress("DEPRECATION")
                    stopForeground(true)
                }
                stopSelf()
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }

    private fun schedulePings() {
        // Don't restart the timer if already counting down — prevents reset on app resume
        if (pingJob?.isActive == true) return
        pingJob = scope.launch {
            while (isActive) {
                delay(INTERVAL_MS)
                firePing()
            }
        }
    }

    private suspend fun firePing() {
        try {
            @Suppress("MissingPermission")
            // Try lastLocation first (fast); fall back to a fresh fix if null
            val loc = fusedClient.lastLocation.await()
                ?: fusedClient.getCurrentLocation(
                    com.google.android.gms.location.Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                    null
                ).await()
                ?: run {
                    Log.d(TAG, "no location available — ping skipped")
                    return
                }
            val lat = loc.latitude
            val lng = loc.longitude
            val ts  = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
                .also { it.timeZone = TimeZone.getTimeZone("UTC") }
                .format(Date())

            val payload = JSONObject().apply {
                put("api_key",     apiKey)
                put("event",       "location_ping")
                put("distinct_id", distinctId)
                put("timestamp",   ts)
                put("properties",  JSONObject().apply {
                    put("device_latitude",  lat)
                    put("device_longitude", lng)
                    put("timestamp",        ts)
                    put("\$lib",            "posthog-android-foreground")
                })
            }.toString()

            val conn = URL("$host/capture/").openConnection() as HttpURLConnection
            conn.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 15_000
                readTimeout    = 15_000
                outputStream.use { it.write(payload.toByteArray()) }
                val code = responseCode
                disconnect()
                Log.d(TAG, "location_ping sent ($lat, $lng) — HTTP $code")
            }
        } catch (e: SecurityException) {
            Log.w(TAG, "Location permission denied: ${e.message}")
        } catch (e: Exception) {
            Log.w(TAG, "firePing error: ${e.message}")
        }
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                CHANNEL_ID,
                "Air Quality Research",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Periodic location check for air quality research"
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(ch)
        }
    }

    private fun buildNotification(): Notification {
        val pi = PendingIntent.getActivity(
            this, 0,
            packageManager.getLaunchIntentForPackage(packageName),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("AirQo")
            .setContentText("Monitoring air quality near you")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentIntent(pi)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setSilent(true)
            .build()
    }
}
