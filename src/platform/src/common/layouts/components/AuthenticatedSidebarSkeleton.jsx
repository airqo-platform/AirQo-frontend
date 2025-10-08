const AuthenticatedSidebarSkeleton = ({ isCollapsed = false }) => {
  const widthClass = isCollapsed ? 'w-12' : 'w-full';

  return (
    <div className="animate-pulse flex flex-col space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`${widthClass} h-10 bg-gray-300 rounded`} />
      ))}
    </div>
  );
};

export default AuthenticatedSidebarSkeleton;
