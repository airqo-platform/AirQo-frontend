import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import AirqoLogo from '@/icons/airqo_logo.svg';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

/**
 * GroupLogo Component
 *
 * Logic:
 * - User flow (not /org/[slug]/*): Always shows AirQo logo
 * - Organization flow (/org/[slug]/*): Shows organization logo or professional initials
 * - No fallback to AirQo for organization flow
 */
const GroupLogo = ({ className = '', style = {} }) => {
  const pathname = usePathname();
  const { activeGroup } = useGetActiveGroup();
  const { groupDetails: orgInfo } = useSelector((state) => state.groups);

  const [imageError, setImageError] = useState(false);

  // Determine if we're in organization flow
  const isOrganizationFlow = useMemo(() => {
    return pathname?.startsWith('/org/');
  }, [pathname]);

  // Get organization data (prefer orgInfo, fallback to activeGroup)
  const organizationData = useMemo(() => {
    return orgInfo || activeGroup;
  }, [orgInfo, activeGroup]);

  // Get organization logo URL
  const logoUrl = useMemo(() => {
    if (!isOrganizationFlow || !organizationData) return null;
    return organizationData.grp_image || organizationData.grp_profile_picture;
  }, [isOrganizationFlow, organizationData]);

  // Get organization initials for placeholder
  const organizationInitials = useMemo(() => {
    if (!organizationData) {
      // If we're in org flow but no data yet, try to get from pathname
      if (isOrganizationFlow && pathname) {
        const matches = pathname.match(/\/org\/([^/]+)/);
        if (matches && matches[1]) {
          return matches[1].substring(0, 2).toUpperCase();
        }
      }
      return 'ORG';
    }
    const name =
      organizationData.grp_title || organizationData.grp_name || 'Organization';
    return name.substring(0, 2).toUpperCase();
  }, [organizationData, isOrganizationFlow, pathname]);

  // Handle image load error
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  // Container styles
  const containerStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }),
    [style],
  );

  // Render AirQo logo for user flow ONLY
  if (!isOrganizationFlow) {
    return (
      <div className={className} style={containerStyle}>
        <AirqoLogo />
      </div>
    );
  }

  // For organization flow: NEVER show AirQo logo
  // Try to show organization logo first
  if (logoUrl && !imageError) {
    return (
      <div className={className} style={containerStyle}>
        <div className="relative w-12 h-12">
          <Image
            src={logoUrl}
            alt={organizationData?.grp_title || 'Organization logo'}
            fill
            sizes="48px"
            className="object-contain rounded"
            onError={handleImageError}
            onLoad={handleImageLoad}
            priority
          />
        </div>
      </div>
    );
  }

  // Always fallback to professional initials for organization flow
  return (
    <div className={className} style={containerStyle}>
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm border border-blue-200">
        <span className="text-white font-bold text-sm tracking-wide">
          {organizationInitials}
        </span>
      </div>
    </div>
  );
};

GroupLogo.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
};

export default GroupLogo;
