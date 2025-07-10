import React from 'react';
import Button from '@/common/components/Button';
import { FaUserPlus, FaEnvelope, FaTrash, FaUsers } from 'react-icons/fa';
import PropTypes from 'prop-types';

const InviteModal = ({
  showInviteModal,
  setShowInviteModal,
  inviteEmails,
  setInviteEmails,
  handleInviteMembers,
  inviteLoading,
  primaryColor,
}) => {
  const handleAddEmailField = () => {
    setInviteEmails([...inviteEmails, '']);
  };

  const handleRemoveEmailField = (index) => {
    if (inviteEmails.length > 1) {
      const newEmails = inviteEmails.filter((_, i) => i !== index);
      setInviteEmails(newEmails);
    }
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };
  if (!showInviteModal) return null;

  const validEmailsCount = inviteEmails.filter((email) => email.trim()).length;

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/80 transition-opacity duration-200"
        onClick={() => setShowInviteModal(false)}
        aria-label="Close invite modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col overflow-hidden z-[10001]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <FaUsers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invite Team Members
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {validEmailsCount}{' '}
                  {validEmailsCount === 1 ? 'invitation' : 'invitations'} ready
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter email addresses to invite members to your organization.
                They will receive an invitation link via email.
              </p>

              {/* Email Input Fields */}
              <div className="space-y-3">
                {inviteEmails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          handleEmailChange(index, e.target.value)
                        }
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder={`Team member ${index + 1} email address`}
                      />
                    </div>
                    {inviteEmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEmailField(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        aria-label="Remove email field"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Another Email Button */}
              <button
                type="button"
                onClick={handleAddEmailField}
                className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
                <FaUserPlus className="w-4 h-4" />
                <span>Add another email address</span>
              </button>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <FaEnvelope className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      Invitation Process
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Invited members will receive an email with a link to join
                      your organization. They can accept or decline the
                      invitation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              onClick={() => {
                setShowInviteModal(false);
                setInviteEmails(['']);
              }}
              variant="outlined"
              disabled={inviteLoading}
              className="text-sm"
              padding="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteMembers}
              disabled={inviteLoading || validEmailsCount === 0}
              className="text-sm bg-primary hover:bg-primary/90 focus:ring-primary text-white disabled:opacity-50"
              padding="px-4 py-2"
            >
              {inviteLoading
                ? 'Sending...'
                : `Send ${validEmailsCount} ${validEmailsCount === 1 ? 'Invitation' : 'Invitations'}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

InviteModal.propTypes = {
  showInviteModal: PropTypes.bool.isRequired,
  setShowInviteModal: PropTypes.func.isRequired,
  inviteEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  setInviteEmails: PropTypes.func.isRequired,
  handleInviteMembers: PropTypes.func.isRequired,
  inviteLoading: PropTypes.bool,
  primaryColor: PropTypes.string,
};

export default InviteModal;
