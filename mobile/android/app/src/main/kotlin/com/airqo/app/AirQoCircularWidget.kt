package com.airqo.app

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.SharedPreferences
import android.net.Uri
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetBackgroundIntent
import es.antonborri.home_widget.HomeWidgetLaunchIntent
import es.antonborri.home_widget.HomeWidgetProvider

class AirQoCircularWidget : HomeWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
        widgetData: SharedPreferences
    ) {
        appWidgetIds.forEach { widgetId ->
            val views = RemoteViews(context.packageName, R.layout.air_qo_circular_widget).apply {
                val pendingIntent = HomeWidgetLaunchIntent.getActivity(
                    context, MainActivity::class.java
                )
                setOnClickPendingIntent(R.id.circular_pm_value, pendingIntent)

                val dataKeys = arrayOf(
                    "circular_location",
                    "circular_date",
                    "circular_pm_value",
                )

                val viewIds = arrayOf(
                    R.id.circular_location,
                    R.id.circular_date,
                    R.id.circular_pm_value
                )

                for (i in dataKeys.indices) {
                    val dataValue = widgetData.getString(dataKeys[i], null) ?: "--"
                    setTextViewText(viewIds[i], dataValue)
                }

                val airquality = widgetData.getString("air_quality", null)

                fun setIndexColor(airquality: String?) {
                    data class ColorRange(
                        val air_quality: String,
                        val resource_id: Int,
                        val text_color: Int
                    )

                    val colorRanges = listOf(
                        ColorRange("good", R.drawable.green_circle, 0xff03B600.toInt()),
                        ColorRange("moderate", R.drawable.yellow_circle, 0xffA8A800.toInt()),
                        ColorRange("unhealthy", R.drawable.orange_circle, 0xffB86000.toInt()),
                        ColorRange("ufsgs", R.drawable.red_circle, 0xffB80B00.toInt()),
                        ColorRange("veryUnhealthy", R.drawable.purple_circle, 0xff8E00AC.toInt()),
                        ColorRange("hazardous", R.drawable.maroon_circle, 0xffDBA5B2.toInt()),
                    )

                    val colorRange = colorRanges.firstOrNull { airquality == it.air_quality }

                    if (colorRange == null) {
                        // handle null or invalid pmValue
                        setInt(
                            R.id.circular_index_color,
                            "setBackgroundResource",
                            R.drawable.green_circle
                        )
                        setTextColor(R.id.circular_pm_scale, 0xff03B600.toInt())
                        setTextColor(R.id.circular_pm_value, 0xff03B600.toInt())
                        setTextColor(R.id.circular_pm_unit, 0xff03B600.toInt())
                    } else {
                        setInt(
                            R.id.circular_index_color,
                            "setBackgroundResource",
                            colorRange.resource_id
                        )
                        setTextColor(R.id.circular_pm_scale, colorRange.text_color)
                        setTextColor(R.id.circular_pm_value, colorRange.text_color)
                        setTextColor(R.id.circular_pm_unit, colorRange.text_color)
                    }
                }

                setIndexColor(airquality)

                val backgroundIntent = HomeWidgetBackgroundIntent.getBroadcast(
                    context,
                    Uri.parse("homeWidgetExample://titleClicked"),
                )
                setOnClickPendingIntent(R.id.circular_refresh, backgroundIntent)
            }
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }

}