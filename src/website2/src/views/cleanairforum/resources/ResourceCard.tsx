import type React from 'react';

import { CustomButton } from '@/components/ui';
import type { Resource } from '@/types/index';
import { formatString } from '@/utils/string-utils';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => (
  <div className="bg-white rounded-lg p-5 lg:p-8 shadow">
    <p className="text-blue-500 text-lg font-semibold mb-2">
      {formatString(resource.resource_category)}
    </p>
    <h3 className="text-2xl lg:text-4xl font-semibold mb-2">
      {resource.resource_title}
    </h3>
    <div className="mb-4">
      <p className="font-semibold text-lg">{resource.author_title}</p>
      <p>{resource.resource_authors}</p>
    </div>
    <div className="flex flex-wrap gap-4">
      {resource.resource_link && (
        <CustomButton
          className="text-black bg-transparent border border-gray-800 hover:bg-gray-100"
          onClick={() => {
            if (resource.resource_link) {
              window.open(
                resource.resource_link,
                '_blank',
                'noopener,noreferrer',
              );
            }
          }}
        >
          Read more →
        </CustomButton>
      )}
      {resource.resource_file && resource.resource_file_url && (
        <CustomButton
          className="text-white bg-blue-500 border border-blue-500 hover:bg-blue-600"
          onClick={() => {
            if (resource.resource_file_url) {
              window.open(
                resource.resource_file_url,
                '_blank',
                'noopener,noreferrer',
              );
            }
          }}
        >
          Download
        </CustomButton>
      )}
    </div>
  </div>
);

export default ResourceCard;
