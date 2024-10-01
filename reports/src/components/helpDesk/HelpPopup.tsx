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

const HelpPopup = () => {
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';

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
          className={`fixed bottom-[94px] right-6 w-80 p-5 bg-white shadow-xl rounded-lg border border-gray-200 dark:bg-gray-800 dark:text-white transition-opacity duration-300 ease-in-out ${
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
            <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gray-300 text-gray-800 p-3 rounded-md shadow hover:bg-gray-400 transition-all duration-300"
                  onClick={() => setShowFeedbackModal(true)}
                >
                  Send Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-800 dark:text-white rounded-lg p-6 shadow-lg max-w-md">
                <DialogTitle>Send Feedback</DialogTitle>
                <DialogDescription>
                  We would love to hear your thoughts or issues you are experiencing with our app.
                </DialogDescription>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Handle feedback form submission logic here
                    alert('Thank you for your feedback!');
                    setShowFeedbackModal(false);
                  }}
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
                      defaultValue={userEmail}
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Type your feedback here"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Submit Feedback
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPopup;
