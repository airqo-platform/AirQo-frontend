import { Metadata } from 'next';

import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

import { generateMetadata } from './generateMetadata';
import { MetadataConfig } from './metadata.config';

// Use fixed-size JPEGs for reliable support in social link preview crawlers.
const OG_IMAGES = {
  airQuality: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  team: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  monitor: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  analytics: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728175853/website/photos/analyticsHome_l3hgcy.png',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  api: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071534/website/photos/wrapper_zpnvdw.png',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  mobileApp: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  networkScreenshot: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  forum: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  community: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132440/website/photos/community/Rectangle_411_toaajz.webp',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  networkCoverage: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1786456550/website/photos/network_zw6quv.webp',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  careers: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728310706/website/photos/about/careerImage_t91yzh.png',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
  events: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section1_usfuoj.webp',
    { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
  ),
} as const;

// Page-specific metadata configurations with enhanced SEO
export const METADATA_CONFIGS = {
  home: {
    title: 'AirQo | Air quality data and research across Africa',
    description:
      'AirQo works with African communities to measure air quality and share data for research, public awareness, and action.',
    keywords:
      'air quality Africa, air pollution monitoring, African air quality network, real-time PM2.5 Africa, air quality sensors Africa, pollution data Africa, air monitoring network, African cities air quality, air quality monitoring system, low-cost sensors Africa, clean air Africa, air quality app Africa, air quality API, environmental monitoring Africa, PM2.5 tracking, air pollution data, Makerere University air quality, Google.org Africa, WHO air quality Africa, air quality research Africa, African environmental data',
    url: '/home',
    image: {
      url: OG_IMAGES.airQuality,
      alt: "AirQo - Africa's Leading Air Quality Monitoring Network with Real-time Pollution Data",
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  products: {
    title: 'AirQo Products | Measure, Understand, and Act on Air Quality',
    description:
      'Explore the AirQo product suite: locally built air quality monitors, calibration, data platforms, forecasting, APIs, and public tools for cleaner air in African cities.',
    keywords:
      'AirQo products, Binos Monitor, AirQalibrate, AirQo Beacon, AirQo Nexus, AirQo AI Platform, Air Quality API, AirQo Mobile App, AirQo Vertex, air quality monitoring Africa, low-cost sensors, air quality data platform',
    url: '/products',
    image: {
      url: OG_IMAGES.monitor,
      alt: 'AirQo products for measuring, understanding, and acting on air quality',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  about: {
    title: 'About AirQo | Air quality research in Africa',
    description:
      "Learn about AirQo's work with researchers, communities, and institutions to improve access to air quality information in Africa.",
    keywords:
      'About AirQo Uganda, Makerere University research, air quality innovation Uganda, Kampala environmental research, AirQo team Kenya, Professor Bainomugisha Uganda, air pollution monitoring Africa, Uganda environmental technology, Kenya air quality research, Nigeria pollution initiative, Ghana clean air, Google.org Africa partnership, World Bank Uganda, EPIC Air Quality Fund Africa, Uganda innovation, East Africa air research, environmental technology Uganda, Kampala innovation hub, African scientists air quality',
    url: '/about-us',
    image: {
      url: OG_IMAGES.team,
      alt: 'AirQo Team at Makerere University - Leading Air Quality Research in Africa',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  monitor: {
    title: 'AirQo Binos air quality monitor',
    description:
      'Learn about the AirQo Binos monitor and how it supports local air quality measurement.',
    keywords:
      'AirQo Binos monitor Uganda, air quality sensors Kenya, pollution monitors Nigeria, Ghana air sensors, Kampala air quality monitor, Nairobi pollution sensor, Lagos air monitor, Accra PM2.5 sensor, African climate sensors, Uganda environmental equipment, Kenya pollution devices, tropical weather sensors, dust-resistant monitors Africa, solar powered air sensors, Uganda made monitors, East Africa air sensors, West Africa pollution monitors, low-cost sensors Uganda, Makerere University sensors',
    url: '/products/monitor',
    image: {
      url: OG_IMAGES.monitor,
      alt: 'AirQo Binos Air Quality Monitor - Locally Designed for African Cities',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  nexus: {
    title: 'AirQo Nexus | Air quality data platform',
    description:
      "View air quality measurements and trends with AirQo Nexus, AirQo's data platform.",
    keywords:
      'Kampala air quality dashboard, Nairobi pollution data, Lagos air quality live, Accra PM2.5 tracking, Uganda air quality platform, Kenya pollution dashboard, Nigeria air data, Ghana air monitoring, East Africa air quality data, real-time pollution Uganda, Kampala PM2.5, Nairobi air trends, AirQo Nexus Uganda, Kenya environmental dashboard, pollution visualization Africa, Jinja air quality, Mombasa pollution, Kisumu air data, African cities AirQo Nexus, platform.airqo.net Uganda',
    url: '/products/nexus',
    image: {
      url: OG_IMAGES.analytics,
      alt: 'AirQo Nexus Platform - Real-time Air Quality Dashboard for Africa',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  api: {
    title: 'Air Quality API | Air quality data for developers',
    description:
      'Use the Air Quality API to access air quality data for applications, research, and analysis.',
    keywords:
      'Air Quality API, air quality API Africa, open air data, developer API, environmental data API, PM2.5 API, pollution data access, RESTful API, air quality SDK, African cities data, real-time air API, historical air data, free API tier, environmental monitoring API',
    url: '/products/api',
    image: {
      url: OG_IMAGES.api,
      alt: 'AirQo Developer API - Open Access to African Air Quality Data',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  beacon: {
    title: 'AirQo Beacon | Monitor network health',
    description:
      'Learn how AirQo Beacon helps teams monitor device health and manage air quality networks.',
    keywords:
      'air quality monitoring network management, device health monitoring, air quality sensor networks, collocation management, air quality device management, sensor network management, network uptime monitoring, low-cost sensor monitoring, air quality data quality, air quality monitoring dashboard, reference monitor collocation',
    url: '/products/beacon',
    image: {
      url: '/assets/images/seo/beacon-social.jpg',
      alt: 'AirQo Beacon device render mounted under a solar panel',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  vertex: {
    title: 'AirQo Vertex | Share air quality data',
    description:
      'Learn how AirQo Vertex helps monitor owners manage devices and share air quality data.',
    keywords:
      'open air quality data sharing platform, open air quality data, public air quality data, open data platform, air quality monitoring network, connect air quality monitors, low-cost air quality sensors, sensor network management, device health monitoring, open air quality network',
    url: '/products/vertex',
    image: {
      url: '/assets/images/seo/vertex-social.jpg',
      alt: 'AirQo Vertex deployment workflow shown on a laptop in a field operations setting',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  aiPlatform: {
    title: 'AirQo AI tools for air quality',
    description:
      'Explore AirQo tools for air quality forecasting, site selection, categorisation, and reporting.',
    keywords:
      'AirQo AI Platform, air quality forecasting, environmental intelligence platform, sensor site selection, air quality reports, site categorization, spatial analysis, PM2.5 forecasting, AI for air quality',
    url: '/products/ai-platform',
    image: {
      url: '/assets/images/seo/ai-platform-social.jpg',
      alt: 'AirQo AI platform shown on a laptop with locate planning and monitoring site selection',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  airqoDevCon: {
    title: 'AirQo DevCon 2026 | Technology and clean air',
    description:
      'Find information about AirQo DevCon 2026, its activities, and opportunities to take part.',
    keywords:
      'AirQo DevCon 2026, Makerere University developer conference, Uganda student developers, clean air hackathon Uganda, hardware firmware workshop, air quality AI workshop, student tech event Kampala, AirQo open source, PCB soldering workshop Uganda, data science air quality',
    url: '/developers/airqo-devcon',
    image: {
      url: '/assets/images/seo/devcon-social.jpg',
      alt: 'Students building clean air hardware and software at AirQo DevCon 2026',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  mobileApp: {
    title: 'AirQo mobile app | Local air quality information',
    description:
      'Get the AirQo app to check air quality information from your phone.',
    keywords:
      'AirQo app Uganda, air quality app Kenya, pollution app Nigeria, Ghana air app, Kampala air quality app, Nairobi pollution app, Lagos air quality tracker, Accra PM2.5 app, Uganda pollution alerts, Kenya air monitoring app, Nigeria environmental app, East Africa air app, African cities air quality, free air quality app Africa, Uganda health app, Kenya pollution tracker, Android air quality Uganda, iOS pollution app Africa, Jinja air app, Mombasa air quality',
    url: '/products/mobile-app',
    image: {
      url: OG_IMAGES.mobileApp,
      alt: 'AirQo Mobile App - Air Quality Monitoring in Your Pocket',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  calibrate: {
    title: 'AirQalibrate | Air quality sensor calibration',
    description:
      'Learn how AirQalibrate supports calibration and quality assurance for air quality sensor data.',
    keywords:
      'AirQalibrate, sensor calibration, air quality calibration, data quality assurance, sensor accuracy, ML calibration, drift correction, sensor maintenance, environmental monitoring QA, calibration platform, sensor network management, data validation',
    url: '/products/calibrate',
    image: {
      url: OG_IMAGES.airQuality,
      alt: 'AirQalibrate - Advanced Sensor Calibration Platform',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  contact: {
    title: 'Contact AirQo',
    description:
      'Contact AirQo with questions about our work, services, or partnership opportunities.',
    keywords:
      'Contact AirQo Uganda, AirQo Kampala office, Makerere University contact, Uganda air quality support, Kenya partnership AirQo, Nigeria collaboration inquiries, Ghana AirQo contact, Kampala office address, Uganda technical support, East Africa partnerships, AirQo email Uganda, Makerere University Kampala, Uganda environmental organization, Kenya AirQo office, African partnership inquiries',
    url: '/contact',
    image: {
      url: OG_IMAGES.team,
      alt: 'Contact AirQo Team - Air Quality Experts at Makerere University',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForum: {
    title: 'Africa Clean Air Forum 2026 | Event information',
    description:
      'Find event information, speakers, sessions, resources, and logistics from Africa Clean Air Forum 2026.',
    keywords:
      'Africa Clean Air Forum Nairobi, Kenya air quality conference, Africa Clean Air Forum 2026, East Africa air conference, Uganda air quality forum, Kenya environmental leaders, Nigeria clean air summit, Ghana air conference, African ministers environment, conference venue, Kampala to Nairobi conference, air quality policy Africa, Kenya climate summit, East Africa environmental forum, African air quality networking, Africa Clean Air Forum 2026 registration',
    url: '/africa-clean-air-forum-2026',
    image: {
      url: OG_IMAGES.forum,
      alt: 'Africa Clean Air Forum 2026 - Partnerships for Clean Air in Africa',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  solutions: {
    title: 'Air quality solutions | AirQo',
    description:
      'Explore AirQo solutions for African cities, communities, research, network coverage, and the Kampala air pollution exposure study.',
    keywords:
      'AirQo solutions, air quality solutions Africa, city air quality monitoring, community air quality information, air quality research data, Africa monitoring network map, Kampala air pollution study, air quality action Africa',
    url: '/solutions',
    image: {
      url: OG_IMAGES.airQuality,
      alt: 'AirQo air quality solutions for cities, communities, and research',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  solutionsAfricanCities: {
    title: 'Air quality solutions for African cities',
    description:
      "Explore AirQo's air quality monitoring and data services for African cities.",
    keywords:
      'Smart city Kampala, Nairobi smart city air quality, Lagos urban monitoring, Accra city pollution, Uganda municipal air monitoring, Kenya city government solutions, Nigeria urban air quality, Ghana smart city sensors, Kampala city planning, Nairobi urban data, African city governments, Uganda urban planning, Kenya municipal solutions, city air dashboard Uganda, urban environmental Uganda, Jinja city monitoring, Mombasa urban planning',
    url: '/solutions/african-cities',
    image: {
      url: OG_IMAGES.monitor,
      alt: 'Air Quality Solutions for African Smart Cities',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  solutionsCommunities: {
    title: 'Community air quality | AirQo',
    description:
      'Learn how AirQo works with communities to understand local air quality and support informed action.',
    keywords:
      'Community air monitoring Uganda, citizen science Kenya, grassroots Nigeria air quality, community empowerment Uganda, Kampala neighborhood pollution, Nairobi community air data, Lagos local air monitoring, African community science, Uganda environmental justice, Kenya local action, community health Uganda, neighborhood air quality Kenya, participatory monitoring Africa, Uganda community leaders, Kenya NGO air monitoring, African community empowerment',
    url: '/solutions/communities',
    image: {
      url: OG_IMAGES.community,
      alt: 'Community-Driven Air Quality Monitoring Solutions',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  solutionsResearch: {
    title: 'Air quality research tools and data | AirQo',
    description:
      'Find AirQo data and tools for air quality research and analysis.',
    keywords:
      'Air quality research Uganda, Makerere University data, Kenya academic air data, Nigeria research API, Ghana environmental research, Uganda university air data, African research collaboration, academic datasets Uganda, Kampala research data, Nairobi university data, air quality science Africa, Uganda policy research, Kenya environmental studies, African air quality publications, research API Uganda, Makerere partnerships',
    url: '/solutions/research',
    image: {
      url: OG_IMAGES.networkScreenshot,
      alt: 'Air Quality Research Data and Tools for Academia',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  solutionsNetworkCoverage: {
    title: 'Africa Network Map',
    description:
      'Explore a map of air quality monitoring networks, cities, and stations across Africa.',
    keywords:
      'Africa air quality monitoring landscape, air quality monitoring Africa, reference monitors Africa, low-cost sensors Africa, air monitoring stations, monitoring network coverage map, African air monitoring infrastructure, environmental sensors Africa, AirQo network, monitoring station locations Africa',
    url: '/solutions/network-coverage',
    image: {
      url: OG_IMAGES.networkCoverage,
      alt: 'Air Quality Monitoring Landscape in Africa - Coverage Map & Sensor Locations',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  solutionsKampalaStudy: {
    title: 'Kampala air pollution exposure study',
    description:
      "Learn about AirQo's Kampala air pollution exposure study and how to take part.",
    keywords:
      'Kampala air quality study, air pollution research Kampala, clean air initiative, citizen science air quality, real-time pollution monitoring, health exposure study, urban air quality research, community participation, environmental health Kampala, AirQo study',
    url: '/solutions/kampala-study',
    image: {
      url: OG_IMAGES.airQuality,
      alt: 'Kampala Air Quality Research Study - Real-time Pollution Monitoring',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  privacyPolicy: {
    title: 'Privacy policy | AirQo',
    description:
      'Read how AirQo collects, uses, and protects personal information.',
    keywords:
      'AirQo privacy policy, data protection, GDPR compliance, user privacy, personal data security, privacy rights, data collection policy, information security',
    url: '/legal/privacy-policy',
    image: {
      url: OG_IMAGES.monitor,
      alt: 'AirQo Privacy Policy and Data Protection',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cookiesPolicy: {
    title: 'Cookies policy | AirQo',
    description:
      'Learn how AirQo uses cookies and local storage on its website and services.',
    keywords:
      'AirQo cookies policy, local storage policy, cookies, browser storage, authentication cookies, analytics cookies, user preferences, Mapbox cookies, Google Auth cookies',
    url: '/legal/cookies',
    image: {
      url: OG_IMAGES.monitor,
      alt: 'AirQo Cookies and Local Storage Policy',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  termsOfService: {
    title: 'Terms of service | AirQo',
    description:
      'Read the terms that apply when using AirQo websites, platforms, and data services.',
    keywords:
      'AirQo terms of service, usage agreement, platform terms, service conditions, API terms, data usage rights, legal terms, user agreement',
    url: '/legal/terms-of-service',
    image: {
      url: OG_IMAGES.monitor,
      alt: 'AirQo Terms of Service',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  paymentRefundPolicy: {
    title: 'Payment and refund policy | AirQo',
    description:
      'Review AirQo payment, billing, and refund terms for paid services.',
    keywords:
      'AirQo payment policy, refund terms, billing policy, payment processing, transaction terms, refund process, service billing',
    url: '/legal/payment-refund-policy',
    image: {
      url: OG_IMAGES.monitor,
      alt: 'AirQo Payment and Refund Policies',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  airqoDataPolicy: {
    title: 'AirQo data access policy',
    description:
      'Review the terms and attribution guidance for accessing and using AirQo data.',
    keywords:
      'AirQo open data, Creative Commons license, data usage policy, open data access, attribution requirements, research data rights, API licensing, environmental data sharing',
    url: '/legal/airqo-data',
    image: {
      url: OG_IMAGES.networkScreenshot,
      alt: 'AirQo Open Data Policy and Licensing',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumSessions: {
    title: 'Sessions and agenda | Africa Clean Air Forum',
    description:
      'Explore sessions and agenda information for Africa Clean Air Forum.',
    keywords:
      'Africa Clean Air Forum agenda, conference sessions, air quality workshops, Africa Clean Air Forum 2026 program, environmental panels, policy discussions, technical workshops, networking events',
    url: '/africa-clean-air-forum-2026',
    image: {
      url: OG_IMAGES.forum,
      alt: 'Africa Clean Air Forum 2026 Conference Sessions',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumSpeakers: {
    title: 'Speakers | Africa Clean Air Forum',
    description: 'Find speaker information for Africa Clean Air Forum.',
    keywords:
      'Africa Clean Air Forum speakers, air quality experts, environmental leaders, conference presenters, WHO officials, African ministers, research scientists, policy makers',
    url: '/africa-clean-air-forum-2026',
    image: {
      url: OG_IMAGES.forum,
      alt: 'Africa Clean Air Forum 2026 Distinguished Speakers',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumResources: {
    title: 'Resources | Africa Clean Air Forum',
    description:
      'Browse resources and materials published for Africa Clean Air Forum.',
    keywords:
      'Africa Clean Air Forum resources, conference materials, research downloads, policy documents, air quality tools, presentation slides, implementation guides, best practices',
    url: '/africa-clean-air-forum-2026',
    image: {
      url: OG_IMAGES.forum,
      alt: 'Africa Clean Air Forum 2026 Resources and Downloads',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumSponsorships: {
    title: 'Sponsorship | Africa Clean Air Forum',
    description:
      'Learn about sponsorship opportunities for Africa Clean Air Forum.',
    keywords:
      'Africa Clean Air Forum sponsorship, partnership opportunities, conference sponsors, exhibition packages, environmental partnerships, corporate sponsorship, event partnership',
    url: '/africa-clean-air-forum-2026',
    image: {
      url: OG_IMAGES.forum,
      alt: 'Africa Clean Air Forum 2026 Sponsorship Opportunities',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumLogistics: {
    title: 'Venue and travel | Africa Clean Air Forum',
    description:
      'Find venue, travel, and attendance information for Africa Clean Air Forum.',
    keywords:
      'Africa Clean Air Forum venue, conference location, travel Kenya, conference hotels, visa information, airport transfers, accommodation, travel logistics',
    url: '/africa-clean-air-forum-2026',
    image: {
      url: OG_IMAGES.forum,
      alt: 'Africa Clean Air Forum 2026 Venue',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumProgramCommittee: {
    title: 'Programme committee | Africa Clean Air Forum',
    description: 'Meet the programme committee for Africa Clean Air Forum.',
    keywords:
      'Africa Clean Air Forum committee, conference organizers, program committee, scientific committee, organizing team, conference leadership, advisory board',
    url: '/africa-clean-air-forum-2026',
    image: {
      url: OG_IMAGES.forum,
      alt: 'Africa Clean Air Forum 2026 Program Committee',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumGlossary: {
    title: 'Air quality glossary | Africa Clean Air Forum',
    description:
      'Browse definitions of air quality and monitoring terms used at Africa Clean Air Forum.',
    keywords:
      'Air quality glossary, PM2.5 definition, AQI explained, air pollution terms, monitoring terminology, WHO guidelines, environmental definitions, technical glossary',
    url: '/africa-clean-air-forum-2026',
    image: {
      url: OG_IMAGES.forum,
      alt: 'Air Quality Terms and Definitions Glossary',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumPartners: {
    title: 'Partners | Africa Clean Air Forum',
    description:
      'Learn about the organizations supporting Africa Clean Air Forum.',
    keywords:
      'Africa Clean Air Forum partners, conference collaborators, WHO partnership, UNEP support, World Bank, Google.org, environmental partners, African organizations',
    url: '/africa-clean-air-forum-2026',
    image: {
      url: OG_IMAGES.forum,
      alt: 'Africa Clean Air Forum 2026 Partners and Collaborators',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  careers: {
    title: 'Careers at AirQo',
    description:
      'Explore current career opportunities and learn about working with AirQo.',
    keywords:
      'AirQo jobs Uganda, environmental careers Kampala, data science jobs Uganda, engineering careers Kenya, Nairobi environmental jobs, Uganda tech careers, remote jobs Uganda, Makerere University careers, Kampala NGO jobs, Kenya data science, Uganda research positions, environmental jobs East Africa, air quality careers Africa, impact jobs Uganda, sustainability careers Kampala, Uganda tech jobs, Kenya engineering jobs',
    url: '/careers',
    image: {
      url: OG_IMAGES.careers,
      alt: 'Join AirQo Team - Environmental Careers in Africa',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  events: {
    title: 'AirQo events',
    description: 'Browse AirQo events, workshops, and community activities.',
    keywords:
      'AirQo events, air quality conferences, environmental workshops, community events, hackathons, training sessions, webinars, African environmental events',
    url: '/events',
    image: {
      url: OG_IMAGES.events,
      alt: 'AirQo Events and Conferences',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  press: {
    title: 'AirQo in the news | Press and media',
    description:
      'Find AirQo media coverage, press information, and contact details for media enquiries.',
    keywords:
      'AirQo press, media coverage, press releases, journalist resources, news coverage, media kit, expert quotes, air quality news, environmental journalism Africa',
    url: '/press',
    image: {
      url: OG_IMAGES.team,
      alt: 'AirQo Press and Media Resources',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  blogs: {
    title: 'AirQo stories and insights',
    description:
      'Read AirQo stories and updates about air quality, research, and community work.',
    keywords:
      'AirQo blogs, air quality insights, environmental stories, clean air updates, air quality research, African air pollution news, community impact stories, air quality blog',
    url: '/blogs',
    image: {
      url: OG_IMAGES.airQuality,
      alt: 'AirQo Blogs and Insights',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  resources: {
    title: 'AirQo publications and guides',
    description:
      'Browse AirQo publications, reports, guides, and other resources.',
    keywords:
      'AirQo resources, research publications, air quality reports, technical guides, policy briefs, educational materials, case studies, datasets, monitoring guides',
    url: '/resources',
    image: {
      url: OG_IMAGES.airQuality,
      alt: 'AirQo Resources and Publications Library',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  faqs: {
    title: 'AirQo FAQs',
    description:
      'Find answers to common questions about AirQo, air quality data, and monitoring.',
    keywords:
      'AirQo FAQ, frequently asked questions, air quality help, sensor questions, data access FAQ, API documentation, PM2.5 explained, partnership inquiries',
    url: '/faqs',
    image: {
      url: OG_IMAGES.airQuality,
      alt: 'AirQo Frequently Asked Questions',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  partners: {
    title: 'AirQo partners and collaborators',
    description:
      'Learn about the organizations working with AirQo on air quality research and action.',
    keywords:
      'AirQo partners, Google.org partnership, World Bank collaboration, WHO partnership, UNEP, environmental partnerships, African collaborations, strategic partners, funding partners',
    url: '/partners',
    image: {
      url: OG_IMAGES.team,
      alt: 'AirQo Strategic Partners and Collaborators',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
} as const;

const formatForumEventName = (uniqueTitle: string): string => {
  const words = uniqueTitle
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  const formatted = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return /africa clean air forum/i.test(formatted)
    ? formatted
    : `Africa Clean Air Forum ${formatted}`;
};

export const getForumPageMetadata = (
  uniqueTitle: string,
  section: string,
  routeSection: string,
): MetadataConfig => {
  const eventName = formatForumEventName(uniqueTitle);

  return {
    title: `${section} | ${eventName} | AirQo`,
    description: `${section} information for ${eventName}.`,
    keywords: `${eventName}, ${section}, clean air, air quality Africa`,
    url: `/africa-clean-air-forum/${encodeURIComponent(uniqueTitle)}/${routeSection}`,
    image: METADATA_CONFIGS.cleanAirForum.image,
  };
};

export type MetadataConfigKey = keyof typeof METADATA_CONFIGS;

/**
 * Helper function to get metadata config with validation
 * @param key - The metadata config key
 * @returns The metadata configuration or null if not found
 */
export function getMetadataConfig(
  key: MetadataConfigKey,
): MetadataConfig | null {
  if (key in METADATA_CONFIGS) {
    return METADATA_CONFIGS[key];
  }
  return null;
}

/**
 * Generate metadata for a specific page
 * @param page - The page key from METADATA_CONFIGS
 * @returns Generated metadata object
 */
export function getPageMetadata(page: MetadataConfigKey): Metadata {
  const config = getMetadataConfig(page);
  if (!config) {
    return generateMetadata(METADATA_CONFIGS.home);
  }
  return generateMetadata(config);
}
