import FacesOfCleanAirPage from '@/features/faces-of-clean-air/FacesOfCleanAirPage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.facesOfCleanAir);

export default function FacesOfCleanAirRoute() {
  return <FacesOfCleanAirPage />;
}
