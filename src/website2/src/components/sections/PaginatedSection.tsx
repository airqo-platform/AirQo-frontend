import React from 'react';

import SectionDisplay from '@/views/cleanairforum/SectionDisplay';

interface PaginatedSectionProps {
  sections: any[];
}

const PaginatedSection: React.FC<PaginatedSectionProps> = ({ sections }) => {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <SectionDisplay key={section.id || index} section={section} />
      ))}
    </div>
  );
};

export default PaginatedSection;
