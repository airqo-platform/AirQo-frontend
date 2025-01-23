import timeZones from "timezones.json"

export const getTimezones = () => {
  return timeZones.map((tz) => ({
    value: tz.utc[0],
    label: `${tz.text} (${tz.utc[0]})`,
  }))
}

