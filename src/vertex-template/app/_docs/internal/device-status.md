# Vertex Device Status Guide

This document defines the current logic used to determine a device's status in Vertex.

## Core Concept

Our logic is based on two independent boolean fields from the API:

### 1. rawOnlineStatus (Raw Data)

- **What it means:** Is the device sending raw, unprocessed data to the cloud?
- **Values:** Transmitting (true) / Not Transmitting (false)

### 2. isOnline (Calibrated Data)

- **What it means:** Is processed, calibrated data available for use?
- **Values:** Data Ready (true) / Processing or No Data (false)

These fields are independent. For example, a device can be transmitting raw data (`rawOnlineStatus: true`) while the calibrated data is still processing (`isOnline: false`).

## Status Definitions

The combination of these two fields determines the device's primary status:

| Status | Color | rawOnlineStatus (Raw Data) | isOnline (Calibrated Data) | Logic Summary |
|--------|-------|----------------------------|----------------------------|---------------|
| **Operational** | Green | true (Transmitting) | true (Data Ready) | Device transmitting • Data ready for use. |
| **Transmitting** | Blue | true (Transmitting) | false (Processing) | Receiving data • Processing calibration |
| **Data Available** | Yellow | false (Not Transmitting) | true (Data Ready) | Using recent data • Not currently transmitting. |
| **Not Transmitting** | Gray | false (Not Transmitting) | false (Processing) | No recent data from the device. |

## Special Case: Invalid Date

| Status | Color | Logic |
|--------|-------|-------|
| **Invalid Date** | Purple | This status appears if the device reports a `lastActive` timestamp that is more than 5 minutes in the future. This indicates a device-level clock or configuration error and overrides the logic above. |
