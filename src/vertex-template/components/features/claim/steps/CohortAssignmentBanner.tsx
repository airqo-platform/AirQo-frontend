const CohortAssignmentBanner = ({
  isExternalOrg,
  isPersonalContext,
  activeGroupTitle,
}: {
  isExternalOrg: boolean;
  isPersonalContext: boolean;
  activeGroupTitle?: string;
}) => (
  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
    <p className="text-sm text-blue-800 dark:text-blue-200">
      <strong>Device will be added to:</strong>
      {isExternalOrg && activeGroupTitle && ` ${activeGroupTitle}`}
      {isPersonalContext && ` as your personal devices`}
    </p>
    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
      You can change ownership or share devices later.
    </p>
  </div>
);

export default CohortAssignmentBanner;