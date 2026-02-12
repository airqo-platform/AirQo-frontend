import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

import ContactPage from './ContactPage';

export const metadata = createMetadata(METADATA_CONFIGS.contact);

const page = () => {
  return (
    <div>
      <ContactPage />
    </div>
  );
};

export default page;
