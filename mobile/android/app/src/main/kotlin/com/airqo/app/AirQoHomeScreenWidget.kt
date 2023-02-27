package com.airqo.app

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Color
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetBackgroundIntent
import es.antonborri.home_widget.HomeWidgetLaunchIntent
import es.antonborri.home_widget.HomeWidgetProvider


class AirQoHomeScreenWidget : HomeWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
        widgetData: SharedPreferences
    ) {
        appWidgetIds.forEach { widgetId ->
            val views = RemoteViews(context.packageName, R.layout.air_qo_home_screen_widget).apply {
                // Open App on Widget Click
                val pendingIntent = HomeWidgetLaunchIntent.getActivity(
                    context, MainActivity::class.java
                )
                setOnClickPendingIntent(R.id.widget_bg, pendingIntent)
                setTextViewText(
                    R.id.location, widgetData.getString("location", null) ?: "--"
                )

                setTextViewText(
                    R.id.date, widgetData.getString("date", null) ?: "--"
                )


                val pmValue = widgetData.getString("pmValue", null)
                setTextViewText(
                    R.id.pmValue, pmValue ?: "--"
                )

                setTextViewText(
                    R.id.forecastValue1, widgetData.getString("forecastValue1", null) ?: "--"
                )
                setTextViewText(
                    R.id.forecastValue2, widgetData.getString("forecastValue2", null) ?: "--"
                )
                setTextViewText(
                    R.id.forecastValue3, widgetData.getString("forecastValue3", null) ?: "--"
                )
                setTextViewText(
                    R.id.time1, widgetData.getString("time1", null) ?: "--"
                )
                setTextViewText(
                    R.id.time2, widgetData.getString("time2", null) ?: "--"
                )
                setTextViewText(
                    R.id.time3, widgetData.getString("time3", null) ?: "--"
                )
//                if (pmValue != null) {
//                    when (pmValue.toDouble()) {
//                        in 0.0..12.0 -> setInt(R.id.index_color, "setBackgroundColor", Color.BLUE)
//                        in 12.1..35.4 -> setInt(R.id.index_color, "setBackgroundColor", Color.BLUE)
//                        in 35.5..55.4 -> setInt(R.id.index_color, "setBackgroundColor", Color.BLUE)
//                        in 55.5..150.4 -> setInt(R.id.index_color, "setBackgroundColor", Color.BLUE)
//                        in 150.5..250.4 -> setInt(
//                            R.id.index_color, "setBackgroundColor", Color.BLUE
//                        )
//                        else -> setInt(R.id.index_color, "setBackgroundColor", Color.BLUE)
//                    }
//                }

                // Detect App opened via Click inside Flutter
//                val pendingIntentWithData = HomeWidgetLaunchIntent.getActivity(
            }

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}


