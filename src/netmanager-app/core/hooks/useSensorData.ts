import { useQuery } from "@tanstack/react-query"

const generateMockData = (fieldId: number, days = 7, points = 24) => {
  const data = []
  const labels = []
  const now = new Date()

  let baseValue = 20
  let amplitude = 5
  let trend = 0

  switch (fieldId) {
    case 1:
      baseValue = 25
      amplitude = 15
      trend = 0.5
      break
    case 2:
      baseValue = 22
      amplitude = 3
      trend = -0.2
      break
    case 3:
      baseValue = 60
      amplitude = 10
      trend = 0
      break
    case 4:
      baseValue = 400
      amplitude = 100
      trend = 1
      break
    default:
      baseValue = 20 + fieldId * 5
      amplitude = 5 + fieldId * 2
      trend = fieldId % 2 === 0 ? 0.3 : -0.3
  }

  for (let i = 0; i < days; i++) {
    for (let j = 0; j < points / days; j++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(date.getHours() - j)

      labels.unshift(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

      const timeOfDay = (date.getHours() / 24) * amplitude
      const dayTrend = i * trend
      const value = baseValue + timeOfDay + dayTrend + Math.random() * amplitude

      data.unshift(value)
    }
  }

  return { values: data, labels }
}

const sensorDataApi = {
  getSensorData: async (fieldId: number, days: number, results: number) => {

    await new Promise((resolve) => setTimeout(resolve, 800))
    return generateMockData(fieldId, days, results)
  },
}

export function useSensorData(fieldId: number, days = 7, results = 100) {
  return useQuery({
    queryKey: ["sensorData", fieldId, days, results],
    queryFn: () => sensorDataApi.getSensorData(fieldId, days, results),
    staleTime: 5 * 60 * 1000,
  })
}
