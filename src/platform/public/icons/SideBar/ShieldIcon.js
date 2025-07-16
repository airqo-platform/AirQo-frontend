const ShieldIcon = ({
  size = 24,
  strokeWidth = 1.5,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M6 10.5l2 2L12.5 8m4.5 3c0 4.909-5.354 8.479-7.302 9.615-.221.13-.332.194-.488.228a1.137 1.137 0 01-.42 0c-.156-.034-.267-.099-.488-.228C6.354 19.48 1 15.91 1 11V6.218c0-.8 0-1.2.13-1.543a2 2 0 01.548-.79c.276-.242.65-.383 1.398-.663L8.438 1.21c.208-.078.312-.117.419-.132a1 1 0 01.286 0c.107.015.21.054.419.132l5.362 2.01c.748.281 1.123.422 1.398.665a2 2 0 01.547.79c.131.343.131.742.131 1.542V11z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ShieldIcon;
