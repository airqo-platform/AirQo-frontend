export const AirQuality = {
  good: {
    title: 'Good',
    description: 'The air is clean and healthy to breathe.',
    svgEmoji: '/images/emojis/good_emoji.svg',
    searchNearbyLocationsText: 'Good Quality Air around you',
    searchOtherLocationsText: 'Locations with Good Quality Air',
    color: '#CFFFCE',
    value: 6,
    minimumValue: 0,
    maximumValue: 12.09
  },
  moderate: {
    title: 'Moderate',
    description: 'The air is acceptable, but sensitive groups may experience some health effects.',
    svgEmoji: '/images/emojis/moderate_emoji.svg',
    searchNearbyLocationsText: 'Moderate Quality Air around you',
    searchOtherLocationsText: 'Locations with Moderate Quality Air',
    value: 23.8,
    color: '#FFFFE7',
    minimumValue: 12.1,
    maximumValue: 35.49
  },
  ufsgs: {
    title: 'Unhealthy For Sensitive Groups',
    description:
      'People with respiratory or heart diseases, children, and elderly may experience health effects.',
    svgEmoji: '/images/emojis/ufgs_emoji.svg',
    searchNearbyLocationsText: 'Nearby locations with air quality Unhealthy For Sensitive Groups',
    searchOtherLocationsText: 'Locations with air quality Unhealthy For Sensitive Groups',
    value: 44,
    color: '#FFF6ED',
    minimumValue: 35.5,
    maximumValue: 55.49
  },
  unhealthy: {
    title: 'Unhealthy',
    description:
      'People with respiratory or heart diseases, children, and elderly may experience health effects.',
    svgEmoji: '/images/emojis/unhealthy_emoji.svg',
    searchNearbyLocationsText: 'Unhealthy Quality Air around you',
    searchOtherLocationsText: 'Locations with Unhealthy Quality Air',
    value: 103,
    color: '#FFDDDB',
    minimumValue: 55.5,
    maximumValue: 150.49
  },
  veryUnhealthy: {
    title: 'Very Unhealthy',
    description:
      'Everyone may begin to experience some adverse health effects and sensitive groups are at higher risk.',
    svgEmoji: '/images/emojis/very_unhealthy_emoji.svg',
    searchNearbyLocationsText: 'Very Unhealthy Quality Air around you',
    searchOtherLocationsText: 'Locations with Very Unhealthy Quality Air',
    value: 200.5,
    color: '#FAE0FF',
    minimumValue: 150.5,
    maximumValue: 250.49
  },
  hazardous: {
    title: 'Hazardous',
    description:
      'Health warnings of emergency conditions. The entire population is more likely to be affected, with serious health effects on sensitive groups.',
    svgEmoji: '/images/emojis/hazardous_emoji.svg',
    searchNearbyLocationsText: 'Hazardous Quality Air around you',
    searchOtherLocationsText: 'Locations with Hazardous Quality Air',
    value: 300,
    color: '#E0C4CB',
    minimumValue: 250.5,
    maximumValue: 500
  }
};
