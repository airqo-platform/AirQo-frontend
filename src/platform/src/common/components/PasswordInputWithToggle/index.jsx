import { AqEye, AqEyeOff } from '@airqo/icons-react';
import InputField from '@/common/components/InputField';

/**
 * Reusable password input component with visibility toggle
 * @param {object} props - Component props
 * @param {string} props.id - Input field ID
 * @param {string} props.label - Input field label
 * @param {string} props.placeholder - Input field placeholder
 * @param {string} props.value - Input field value
 * @param {function} props.onChange - Input field onChange handler
 * @param {boolean} props.showPassword - Password visibility state
 * @param {function} props.onToggleVisibility - Toggle visibility handler
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.error - Error message
 * @param {object} props.containerClassName - Container CSS classes
 * @param {object} props.buttonClassName - Toggle button CSS classes
 * @returns {JSX.Element} Password input with toggle
 */
const PasswordInputWithToggle = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  required = false,
  error = '',
  containerClassName = 'relative',
  buttonClassName = 'absolute right-3 top-12 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300',
  ...inputProps
}) => {
  return (
    <div className={containerClassName}>
      <InputField
        id={id}
        label={label}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        error={error}
        {...inputProps}
      />
      <button
        type="button"
        className={buttonClassName}
        onClick={onToggleVisibility}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <AqEyeOff size={20} /> : <AqEye size={20} />}
      </button>
    </div>
  );
};

export default PasswordInputWithToggle;
