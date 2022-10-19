# AirQalibrate

AirQalibrate is a low-cost sensor calibration tool developed by AirQo to facilitate low-cost Air quality monitoring in sub-Saharan Africa. The tool can be used to calibrate PM2.5 and PM10 concentrations from your low-cost air quality sensors using machine learning methods. This document introduces AirQalibrate and outlines the necessary requirements to utilise the tool for your low-cost air monitoring device.

## Why use AirQalibrate?

1. It can be used to improve the accuracy of data from your low-cost air quality monitors

2. It reduces operational costs of monitoring;
   a. The tool does not require access to a reference grade monitor which is very costly.

   b. Reduces costs of acquiring skilled labour to build your calibration models.

## The user interface (UI)

The UI of the calibration tool allows a user to upload CSV containing air quality data to be calibrated and if available collocated reference grade monitor data. The user is then required to specify the columns in the CSV containing the data required by the various fields as follows:

- Browse: Upload CSV file containing timestamp, sensor1_pm2.5, sensor1_pm10, sensor2_pm2.5, sensor2_pm10, temperature, humidity and reference PM readings if available.

- Datetime Column Name: Column with timestamps in uploaded CSV.

- Sensor 1 PM2.5 Column Name: Column with sensor 1 PM2.5 data in uploaded CSV.

- Sensor 2 PM2.5 Column Name: Column with sensor 2 PM2.5 data.

- Sensor 1 PM10 Column Name: Column with sensor 1 PM10 data.

- Sensor 2 PM10 Column Name: Column with sensor 2 PM10 data.

- Temperature Column Name: Column with temperature readings.

- Humidity Column Name: Column with humidity readings.

- Reference data Column Name: Column with reference monitor PM values in uploaded CSV.

- Reference Data Pollutant Type: Select the pollutant measured by your reference monitor from the dropdown menu. This should be the same as the pollutant measured by your corresponding low-cost monitor.

|                                          [image](../_media/)                                          |
| :---------------------------------------------------------------------------------------------------: |
| <b>Figure 3. AirQalibrate UI when the user selects No under the “Reference Monitor Data” section.</b> |

|                                          [image](../_media/)                                           |
| :----------------------------------------------------------------------------------------------------: |
| <b>Figure 4. AirQalibrate UI when the user selects Yes under the “Reference Monitor Data” section.</b> |

## How does it work?

The tool allows you to upload a CSV containing your low-cost sensor PM concentrations and specify the CSV column corresponding to the required field on the tool’s user interface. The uploaded data is calibrated. The results are automatically downloaded when the calibration process is completed.

## Getting Started

AirQalibrate is available to anyone with access to AirQo’s air quality [analytics platform](https://platform.airqo.net/dashboard). To create an account follow this [link](https://airqo.africa/explore-data/get-started).

To open AirQualibrate, follow these steps:

1. Login to the [analytics platform](https://platform.airqo.net/dashboard).
2. From the top banner, open the AirQo Apps menu.
3. From the Apps menu, click on calibrate App icon to open the calibrate UI

[image](../_media/)

4. Upload a CSV containing your raw low-cost sensor’s data and assign each field on the UI a corresponding column in the CSV.

   a. If your CSV contains reference monitor data, select <b>Yes</b> under the reference monitor data section and specify the pollutant measured by the reference monitor from the drop-down menu else select <b>No</b>. The reference monitor data show be from a monitor collocated with the low-cost monitors being calibrated.

   b. If you select <b>Yes</b> under the reference monitor data section, the model will be trained will collocation data from your devices, then the low-cost sensor data will be calibrated using this model. If you select <b>No</b>, your data will be calibrated with a model trained using collocation data from AirQo and BAM devices

5. Hit the calibrate data button to begin the calibration process. This may take a while depending on the amount of data uploaded.

6. Once the calibration process is complete, a CSV containing your calibrated data will be downloaded to your computer.
