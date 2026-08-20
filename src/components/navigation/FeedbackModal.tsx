import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, Heart } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackType, setFeedbackType] = useState<'request_material' | 'bug_or_issue' | 'suggestion'>('request_material');
  const [subjectOrTopic, setSubjectOrTopic] = useState('');
  const [message, setMessage] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Thank you! Your feedback has been recorded.', 'success');
      setTimeout(() => {
        setIsSubmitted(false);
        setSubjectOrTopic('');
        setMessage('');
        setStudentContact('');
        onClose();
      }, 1400);
    }, 400);
  };

  return (
    <div
      id="feedback-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      <div
        id="feedback-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 id="feedback-dialog-title" className="font-serif font-bold text-base text-slate-900 leading-none">
                Student Feedback & Requests
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Help improve StudyZone MJCET for your department
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close feedback dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Feedback Received
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thank you for contributing to StudyZone. We will verify and update the academic repository accordingly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Category selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                What would you like to submit?
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFeedbackType('request_material')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                    feedbackType === 'request_material'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Request Notes
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('suggestion')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                    feedbackType === 'suggestion'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Suggestion
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('bug_or_issue')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                    feedbackType === 'bug_or_issue'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Report Issue
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="feedback-subject" className="text-xs font-semibold text-slate-700 block mb-1">
                Subject / Topic (Optional)
              </label>
              <input
                id="feedback-subject"
                type="text"
                value={subjectOrTopic}
                onChange={(e) => setSubjectOrTopic(e.target.value)}
                placeholder="e.g. Engineering Physics Unit 3, DBMS PYQs 2024"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="feedback-message" className="text-xs font-semibold text-slate-700 block mb-1">
                Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="feedback-message"
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the material you are looking for or the feedback you'd like to share..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label htmlFor="feedback-contact" className="text-xs font-semibold text-slate-700 block mb-1">
                Email / Roll Number (Optional)
              </label>
              <input
                id="feedback-contact"
                type="text"
                value={studentContact}
                onChange={(e) => setStudentContact(e.target.value)}
                placeholder="e.g. 1604-23-733-xxx or student@mjcollege.ac.in"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Made for MJCET Students</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
