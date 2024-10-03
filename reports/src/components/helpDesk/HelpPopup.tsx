'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { FaRegCommentDots } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sendFeedback } from '@/services/api';

const HelpPopup = () => {
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    email: '',
    message: '',
    country: '',
  });

  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';

  // Handle feedback submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const feedbackData = {
      email: feedback.email || userEmail,
      subject: 'Reporting tool feedback submission',
      message: feedback.message,
      country: feedback.country,
    };

    try {
      console.info('Sending feedback:', feedbackData);
      const response = await sendFeedback(feedbackData);
      if (response.success) {
        setShowFeedbackModal(false);
        setShowSuccessDialog(true);
        setFeedback({ email: '', message: '', country: '' });
      } else {
        alert('Error: Unable to send feedback. Please try again.');
      }
    } catch (error: unknown) {
      alert('Error: Something went wrong. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6">
      {/* Help Icon Button */}
      <button
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
        onClick={() => setShowHelpPopup(!showHelpPopup)}
        aria-label="Help Button"
      >
        <FaRegCommentDots size={24} />
      </button>

      {/* Help Popup */}
      {showHelpPopup && (
        <div
          className={`fixed bottom-[94px] right-6 w-80 p-5 bg-white shadow-xl rounded-xl border border-gray-200 dark:bg-gray-800 dark:text-white transition-opacity duration-300 ease-in-out ${
            showHelpPopup ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Need Assistance?</h3>
            <button
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-all duration-300"
              onClick={() => setShowHelpPopup(false)}
              aria-label="Close Help Popup"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            If you have any questions or need assistance, feel free to ask!
          </p>
          <div className="flex flex-col space-y-3">
            <Button
              className="bg-blue-600 text-white p-3 rounded-md shadow hover:bg-blue-700 transition-all duration-300"
              onClick={() => router.push('/help')}
            >
              Visit Help Page
            </Button>
            <Dialog
              open={showFeedbackModal}
              onOpenChange={setShowFeedbackModal}
            >
              <DialogTrigger asChild>
                <Button
                  className="bg-gray-300 text-gray-800 p-3 rounded-md shadow hover:bg-gray-400 transition-all duration-300"
                  onClick={() => setShowFeedbackModal(true)}
                >
                  Send Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-800 dark:text-white rounded-xl p-6 shadow-lg max-w-md">
                <DialogTitle>Send Feedback</DialogTitle>
                <DialogDescription>
                  We would love to hear your thoughts or issues you are
                  experiencing with our app.
                </DialogDescription>
                <form
                  onSubmit={handleFeedbackSubmit}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      className="mt-1"
                      required
                      value={feedback.email || userEmail}
                      onChange={(e) =>
                        setFeedback({ ...feedback, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country (Optional)</Label>
                    <Input
                      type="text"
                      id="country"
                      placeholder="Enter your country"
                      className="mt-1"
                      value={feedback.country}
                      onChange={(e) =>
                        setFeedback({ ...feedback, country: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Type your feedback here"
                      className="mt-1"
                      required
                      value={feedback.message}
                      onChange={(e) =>
                        setFeedback({ ...feedback, message: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            {/* Success Dialog */}
            <Dialog
              open={showSuccessDialog}
              onOpenChange={setShowSuccessDialog}
            >
              <DialogContent className="bg-white dark:bg-gray-800 dark:text-white rounded-xl p-6 shadow-lg max-w-sm">
                <DialogTitle>Feedback Submitted</DialogTitle>
                <DialogDescription>
                  Thank you for your feedback! We have received your message and
                  will get back to you soon.
                </DialogDescription>
                <div className="flex justify-end mt-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setShowSuccessDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPopup;
