# The AirQo use case: ML-based approach

There are several field calibration methods. We chose to use ML-based calibration methods because of their advantages for example they are cheaper to develop and implement compared to physical models, can be deployed to a cloud platform to calibrate data from the entire air quality monitoring network and can be used to calibrate devices in near real-time. The main steps involved with this approach include:

## Step 1: Collocation

In order to build an ML-based field calibration method, you need collocation data from a reference grade monitor and a low-cost monitor. Collocation means installing two devices next to each other such that they are sampling the same air and thus readings from the collocated devices are expected to be similar. Please follow our [deployment guide](https://docs.google.com/document/d/1DVcb84o8u-Kmdjm6Nn-9wJPB1BdcB82Esa5vw3MARyI/edit#heading=h.sznn7whwrjbm) for more information on collocation.

### Important Considerations:

- Choose an approved reference grade monitor that measures pollutants of interest at least once a day (PM<small>2.5</small>, PM<small>10</small>). Some reference monitors can be configured to measure more than one pollutant for example the Beta attenuation monitor can be configured to measure both PM<small>2.5</small> and PM<small>10</small> but not at the same time.

- The collocation site should be representative of the areas where your low-cost sensors are normally deployed.

- The low-cost monitors should be atmost 50 metres from the reference grade monitor but preferable next to each other.

- The minimum colocation time depends on the ML model but it is important to maintain the collocation for the duration of the project in order to provide data for periodic updates to your models.

## Step 2: Developing a calibration model

Our ML-based field calibration models were developed using collocation data from the [AirQo](https://airqo.africa/) devices and standard Beta Attenuation Monitors (BAM 1022) at two monitoring sites in Uganda. Collocation data is used to train a machine learning algorithm which learns the relationship (formula) between this data. The formula is then used to translate data from the low-cost monitor to the reference grade monitor equivalent. Data from the reference monitor is also used to evaluate the performance of the machine learning algorithm by comparing calibrated low-cost values with readings from the reference grade monitor at a given time.

The performance of the ML models developed was tested on:

1. Other AirQo and PurpleAir devices.
2. Monitoring sites in Uganda and Addis Abba, Ethiopia

The machine learning models are trained periodically in order to capture seasonal variations in ambient conditions.

| <img src='_media/ml_based_approach_bam_1.png' alt='BAM_PM2.5' /> <img src='_media/ml_based_approach_bam_2.png' alt='BAM_PM10' /> |
| :------------------------------------------------------------------------------------------------------------------------------: |
|                                   <b>Improvement in data accuracy after field calibration</b>                                    |

## Step 3: Deploying the model to a data Pipeline

Data from all devices on the AirQo network is streamed in near real-time, cleaned and stored in the cloud. After every hour, the data for each device is averaged and calibrated before it is made available to external users through an API or data download feature on our [analytics platform](https://platform.airqo.net/dashboard). Calibrated data is also used to perform additional analysis and generate insights; results from this analysis are displayed through graphs and maps that can be accessed through the analytics platform, AirQo website or mobile application.

| <img src='_media/ml_based_approach_bam_3.png' alt='visual_representation_of_the_data_pipeline' /> |
| :-----------------------------------------------------------------------------------------------: |
|                       <b>A visual representation of the data pipeline.</b>                        |
