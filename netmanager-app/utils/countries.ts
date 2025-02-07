import countries from "i18n-iso-countries"
import enLocale from "i18n-iso-countries/langs/en.json"

countries.registerLocale(enLocale)

export const getCountries = () => {
  const countryObj = countries.getNames("en", { select: "official" })
  return Object.entries(countryObj).map(([code, name]) => ({
    value: code,
    label: name,
  }))
}

