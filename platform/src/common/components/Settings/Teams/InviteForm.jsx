import PersonIcon from '@/icons/Settings/person.svg';
import MailIcon from '@/icons/Settings/mail.svg';
import PlusIcon from '@/icons/Settings/plus.svg';
import Button from '@/components/Button';
import { useState } from 'react';

const TeamInviteForm = ({ open, closeModal }) => {
  const [emails, setEmails] = useState(['']);

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index) => {
    const updatedEmails = [...emails];
    updatedEmails.splice(index, 1);
    setEmails(updatedEmails);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform validation checks on the emails before submitting the form
    const isValid = emails.every((email) => isValidEmail(email));
    if (isValid) {
      // Submit the form
    } else {
      // Display an error message or handle invalid emails
    }
  };

  const isValidEmail = (email) => {
    // Implement your email validation logic here
    // You can use regular expressions or any other method to validate the email format
    // Return true if the email is valid, false otherwise
  };

  const handleCancel = () => {
    setEmails(['']);
    closeModal();
  };

  return (
    <dialog id='report_detail_popup' className={`modal ${open && 'modal-open'} w-screen h-screen`}>
      <form
        method='dialog'
        className='modal-box p-6 overflow-y-scroll rounded max-w-[400px] max-h-[449px] w-full h-full shadow border border-slate-100'
      >
        <div className='flex justify-between items-start mb-5'>
          <div className='w-14 h-14 rounded-[28px] flex justify-center items-center bg-primary-100'>
            <PersonIcon />
          </div>
          <button onClick={closeModal} className='btn btn-sm btn-circle btn-ghost'>
            ✕
          </button>
        </div>
        <div className='self-stretch h-full overflow-y-auto'>
          <h3 className='text-lg font-medium text-secondary-neutral-light-800 leading-[26px] mb-2'>
            Invite team member
          </h3>
          <p className='text-sm text-secondary-neutral-light-400 leading-5 mb-5'>
            Your new organisation has been created. Invite your team to collaborate on this project.
          </p>

          <div className='flex flex-col gap-3 justify-start'>
            {emails.map((email, index) => (
              <div className='relative' key={index}>
                <input
                  type='text'
                  placeholder='Enter organization email'
                  className='input input-bordered w-full pl-9 placeholder-shown:text-secondary-neutral-light-300 placeholder-shown:font-normal text-secondary-neutral-light-800 text-sm leading-[26px] border border-secondary-neutral-light-100 bg-secondary-neutral-light-25 rounded'
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                />
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <MailIcon />
                </div>
                {index > 0 && (
                  <button
                    className='absolute inset-y-0 right-0 flex justify-center items-center mr-3 pointer-events-auto'
                    onClick={() => handleRemoveEmail(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <Button
              className='text-sm font-medium text-primary-600 leading-5 gap-2 w-auto h-5 mt-3 mb-8'
              onClick={handleAddEmail}
            >
              <PlusIcon /> <span>Add email</span>
            </Button>

            <div className='flex gap-3'>
              <Button
                className='text-sm font-medium text-secondary-neutral-light-600 leading-5 w-[170px] h-[44px] border border-secondary-neutral-light-100 rounded'
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className='text-sm font-medium bg-primary-600 text-white leading-5 w-[170px] h-[44px] rounded'
                onClick={handleSubmit}
              >
                Send invites
              </Button>
            </div>
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default TeamInviteForm;
