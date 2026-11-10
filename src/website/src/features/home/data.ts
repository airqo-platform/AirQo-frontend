/* eslint-disable simple-import-sort/imports */
import Google from '@public/assets/images/partners/google.svg';
import UN from '@public/assets/images/partners/UN.svg';
import UsMission from '@public/assets/images/partners/usmissionuganda.svg';
import WorldBank from '@public/assets/images/partners/worldbankgroup.svg';

import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';
/* eslint-enable simple-import-sort/imports */

export const partnerLogos = [
  Google,
  UsMission,
  optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757926788/website/uploads/partners/logos/CleanAirFund-Logo-ORANGE-CMYK_1_cabye7.png',
    { width: 440 },
  ),
  WorldBank,
  UN,
];
