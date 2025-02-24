export type Config = {
  templateName: string;
  homePageUrl: string;
  containerClass: string;
};

const mainConfig: Config = {
  templateName: 'AirQo Website',
  homePageUrl: '/home',
  containerClass: 'max-w-5xl mx-auto w-full',
};

export default mainConfig;
