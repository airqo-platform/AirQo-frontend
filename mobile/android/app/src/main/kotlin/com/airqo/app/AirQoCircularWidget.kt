package com.airqo.app

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.SharedPreferences
import android.widget.RemoteViews
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
                setOnClickPendingIntent(R.id.circular_widget_bg, pendingIntent)
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

                val pmValue = widgetData.getString("circular_pm_value", null)

                fun setIndexColor(pmValue: String?) {
                    data class ColorRange(
                        val minValue: Int,
                        val maxValue: Int,
                        val resourceId: Int,
                        val textColor: Int
                    )

                    val colorRanges = listOf(
                        ColorRange(0, 12, R.drawable.green_circle, 0xff03B600.toInt()),
                        ColorRange(13, 35, R.drawable.yellow_circle, 0xffA8A800.toInt()),
                        ColorRange(36, 55, R.drawable.orange_circle, 0xffB86000.toInt()),
                        ColorRange(56, 150, R.drawable.red_circle, 0xffB80B00.toInt()),
                        ColorRange(151, 250, R.drawable.purple_circle, 0xff8E00AC.toInt()),
                        ColorRange(
                            Int.MAX_VALUE,
                            Int.MAX_VALUE,
                            R.drawable.maroon_circle,
                            0xffDBA5B2.toInt()
                        )
                    )

                    val colorRange =
                        colorRanges.firstOrNull { pmValue?.toIntOrNull()!! in it.minValue..it.maxValue }

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
                            colorRange.resourceId
                        )
                        setTextColor(R.id.circular_pm_scale, colorRange.textColor)
                        setTextColor(R.id.circular_pm_value, colorRange.textColor)
                        setTextColor(R.id.circular_pm_unit, colorRange.textColor)
                    }
                }


                setIndexColor(pmValue)
            }

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }

}