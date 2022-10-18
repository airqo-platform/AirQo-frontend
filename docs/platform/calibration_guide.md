# Field Calibration Guide


# Contents

## Overview

## The need for calibration

## The AirQo use case: ML-based approach
Step 1: [Collocation](#example)
Step 2: [Developing a calibration model](#example2)
Step 3: [Deploying the model to a data Pipeline](#third-example)

## AirQalibrate
[Why use AirQalibrate?](#example)
[The user interface (UI)](#example2)
[How does it work?](#third-example)
[Getting Started]()

## Support services

# Overview

Low-cost air quality monitors are relied on to increase the geographical coverage of air quality monitoring networks, especially in low-resource settings where access to reference grade monitors is limited. 

However, low-cost sensors require field calibration to improve their performance. In this document, we provide users with a guide on how to calibrate low-cost sensors based on the AirQo experience and help the reader appreciate the various factors involved in field calibration. 

We also introduce AirQualibrate, a tool that enables users without access to reference grade monitors or technical expertise to develop a calibration model to calibrate data (PM2.5 and PM10) from their low-cost monitors.

# The need for calibration

Low-cost air quality sensors are sensitive to ambient conditions such as humidity and temperature which can affect the quality of data from these sensors. 

Field calibration provides a means to correct this data thereby improving data quality and reliability. 

# The AirQo use case: ML-based approach

There are several field calibration methods. We chose to use ML-based calibration methods because of their advantages for example they are cheaper to develop and implement compared to physical models, can be deployed to a cloud platform to calibrate data from the entire air quality monitoring network and can be used to calibrate devices in near real-time. The main steps involved with this approach include: 

## Step 1: Collocation

In order to build an ML-based field calibration method, you need collocation data from a reference grade monitor and a low-cost monitor. Collocation means installing two devices next to each other such that they are sampling the same air and thus readings from the collocated devices are expected to be similar. Please follow our [deployment guide](https://docs.google.com/document/d/1DVcb84o8u-Kmdjm6Nn-9wJPB1BdcB82Esa5vw3MARyI/edit#heading=h.sznn7whwrjbm) for more information on collocation. 

### Important Considerations:

* Choose an approved reference grade monitor that measures pollutants of interest at least once a day (PM2.5, PM10). Some reference monitors can be configured to measure more than one pollutant for example the Beta attenuation monitor can be configured to measure both PM2.5 and PM10 but not at the same time. 

* The collocation site should be representative of the areas where your low-cost sensors are normally deployed. 

* The low-cost monitors should be atmost 50 metres from the reference grade monitor but preferable next to each other.

* The minimum colocation time depends on the ML model but it is important to maintain the collocation for the duration of the project in order to provide data for periodic updates to your models.


## Step 2: Developing a calibration model

Our ML-based field calibration models were developed using collocation data from the [AirQo](https://airqo.africa/) devices and standard Beta Attenuation Monitors (BAM 1022) at two monitoring sites in Uganda. Collocation data is used to train a machine learning algorithm which learns the relationship (formula) between this data. The formula is then used to translate data from the low-cost monitor to the reference grade monitor equivalent. Data from the reference monitor is also used to evaluate the performance of the machine learning algorithm by comparing calibrated low-cost values with readings from the reference grade monitor at a given time.

The performance of the ML models developed was tested on:

1. Other AirQo and PurpleAir devices.
2. Monitoring sites in Uganda and Addis Abba, Ethiopia

The machine learning models are trained periodically in order to capture seasonal variations in ambient conditions.

|         [BAM_PM2.5](../_media/)    [BAM_PM10](../_media/)             |
| :--------------------------------------------------------------------------------: |
| <b>Figure 1: Improvement in data accuracy after field calibration</b> |

## Step 3: Deploying the model to a data Pipeline

Data from all devices on the AirQo network is streamed in near real-time, cleaned and stored in the cloud. After every hour, the data for each device is averaged and calibrated before it is made available to external users through an API or data download feature on our [analytics platform](https://platform.airqo.net/dashboard). Calibrated data is also used to perform additional analysis and generate insights; results from this analysis are displayed through graphs and maps that can be accessed through the analytics platform, AirQo website or mobile application.

|         [image](../_media/)             |
| :--------------------------------------------------------------------------------: |
| <b>Figure 2: A visual representation of the data pipeline.</b> |

# AirQalibrate

AirQalibrate is a low-cost sensor calibration tool developed by AirQo to facilitate low-cost Air quality monitoring in sub-Saharan Africa. The tool can be used to calibrate PM2.5 and PM10 concentrations from your low-cost air quality sensors using machine learning methods. This document introduces AirQalibrate and outlines the necessary requirements to utilise the tool for your low-cost air monitoring device.

## Why use AirQalibrate?

1. It can be used to improve the accuracy of data from your low-cost air quality monitors

2. It reduces operational costs of monitoring; 
 a. The tool does not require access to a       reference grade monitor which is very costly. 

    b. Reduces costs of acquiring skilled labour to build your calibration models.


## The user interface (UI)

The UI of the calibration tool allows a user to upload CSV containing air quality data to be calibrated and if available collocated reference grade monitor data. The user is then required to specify the columns in the CSV containing the data required by the various fields as follows:

* Browse: Upload CSV file containing timestamp, sensor1_pm2.5, sensor1_pm10, sensor2_pm2.5, sensor2_pm10, temperature, humidity and reference PM readings if available.

* Datetime Column Name: Column with timestamps in uploaded CSV.

* Sensor 1 PM2.5  Column Name: Column with sensor 1 PM2.5 data in uploaded CSV.

* Sensor 2 PM2.5  Column Name: Column with sensor 2 PM2.5 data.

* Sensor 1 PM10  Column Name: Column with sensor 1 PM10 data.

* Sensor 2 PM10  Column Name: Column with sensor 2 PM10 data.

* Temperature  Column Name: Column with temperature readings. 

* Humidity  Column Name: Column with humidity readings.

* Reference data Column Name: Column with reference monitor PM values in uploaded CSV. 

* Reference Data Pollutant Type: Select the pollutant measured by your reference monitor from the dropdown menu. This should be the same as the pollutant measured by your corresponding low-cost monitor.  

|         [image](../_media/)             |
| :--------------------------------------------------------------------------------: |
| <b>Figure 3. AirQalibrate UI when the user selects No under the “Reference Monitor Data” section.</b> |

|         [image](../_media/)             |
| :--------------------------------------------------------------------------------: |
| <b>Figure 4. AirQalibrate UI when the user selects Yes under the “Reference Monitor Data” section.</b> |


## How does it work?

The tool allows you to upload a CSV containing your low-cost sensor PM concentrations and specify the CSV column corresponding to the required field on the tool’s user interface. The uploaded data is calibrated. The results are automatically downloaded when the calibration process is completed.

## Getting Started

AirQalibrate is available to anyone with access to AirQo’s air quality [analytics platform](https://platform.airqo.net/dashboard). To create an account follow this [link](https://airqo.africa/explore-data/get-started).

To open AirQualibrate, follow these steps:
1. Login to the  [analytics platform](https://platform.airqo.net/dashboard).
2. From the top banner, open the AirQo Apps menu.
3. From the Apps menu, click on calibrate App icon to open the calibrate UI

 [image](../_media/)   

 4. Upload a CSV containing your raw low-cost sensor’s data and assign each field on the UI a corresponding column in the CSV.

    a. If your CSV contains reference monitor data, select <b>Yes</b> under the reference monitor data section and specify the pollutant measured by the reference monitor from the drop-down menu else select <b>No</b>. The reference monitor data show be from a monitor collocated with the low-cost monitors being calibrated. 

    b. If you select <b>Yes</b> under the reference monitor data section, the model will be trained will collocation data from your devices, then the low-cost sensor data will be calibrated using this model. If you select <b>No</b>, your data will be calibrated with a model trained using collocation data from AirQo and BAM devices

5. Hit the calibrate data button to begin the calibration process. This may take a while depending on the amount of data uploaded.

6. Once the calibration process is complete, a CSV containing your calibrated data will be downloaded to your computer.


## Support services

If you need additional support, send us an email at [support@airqo.net](support@airqo.net)



<!-- ## Example
## Example2
## Third Example
## [Fourth Example](http://www.fourthexample.com)  -->