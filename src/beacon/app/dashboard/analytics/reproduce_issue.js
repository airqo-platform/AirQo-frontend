
const processPerformanceData = (
    timestamp
) => {

    // Group data by date (since timestamps are hourly)
    const dailyData = {}

    timestamp.forEach((ts, index) => {
        const date = new Date(ts).toDateString() // Group by date only

        if (!dailyData[date]) {
            dailyData[date] = { hours: 0 }
        }
    })

    // Convert to arrays for history graphs
    const dates = Object.keys(dailyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).slice(-14) // Sort chronologically and take last 14 days

    return dates;
}

const timestamps = [
    "2023-01-01T00:00:00Z",
    "2023-01-02T00:00:00Z",
    "2023-01-03T00:00:00Z",
    "2023-01-04T00:00:00Z"
];

console.log("Input:", timestamps);
const result = processPerformanceData(timestamps);
console.log("Output (Left to Right):", result);
