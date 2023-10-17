import React from 'react'
import AccountPageLayout from '@/common/components/Account/Layout';

const OrganisationCreationPageLayout = ({
    children
}) => {
  return (
    <AccountPageLayout>
        {children}
    </AccountPageLayout>
  )
}

export default OrganisationCreationPageLayout;