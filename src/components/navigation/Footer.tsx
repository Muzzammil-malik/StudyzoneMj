import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Linkedin, Heart, BookOpen, ExternalLink, ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onSelectSubject?: (subjectId: string) => void;
  onOpenFeedback: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectSubject, onOpenFeedback }) => {
  return (
    <footer id="main-footer" className="mt-20 border-t border-border-subtle bg-white text-content-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Col 1: Brand & Slogan */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-academic text-2xl font-bold tracking-tight text-content-primary">
                StudyZone MJCET
              </span>
            </div>

            <p className="text-base text-content-secondary font-medium">
              Everything you need to score better.
            </p>

            <p className="text-xs text-content-muted leading-relaxed max-w-sm">
              An independent, student-first digital library crafted for Muffakham Jah College of Engineering & Technology. Fast, zero ads, no login barrier.
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-content-secondary font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Autonomous & AICTE Syllabus Aligned</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-muted">
              Academic Library
            </h4>
            <ul className="space-y-2 text-sm text-content-secondary">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectSubject?.('engineering-physics')}
                  className="hover:text-brand-600 transition-colors text-left cursor-pointer"
                >
                  Engineering Physics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectSubject?.('programming-for-problem-solving')}
                  className="hover:text-brand-600 transition-colors text-left cursor-pointer"
                >
                  Programming for Problem Solving (PPS)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectSubject?.('basic-electrical-engineering')}
                  className="hover:text-brand-600 transition-colors text-left cursor-pointer"
                >
                  Basic Electrical Engineering
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectSubject?.('matrices-and-differential-calculus')}
                  className="hover:text-brand-600 transition-colors text-left cursor-pointer"
                >
                  Matrices & Differential Calculus (M1)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenFeedback}
                  className="text-brand-600 hover:text-brand-700 font-medium transition-colors cursor-pointer"
                >
                  Request New Subject Notes →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Creator Credentials */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-muted">
              Created & Maintained By
            </h4>

            <div className="p-4 rounded-2xl bg-bg-main border border-border-subtle space-y-3">
              <div className="flex items-center gap-1 text-sm font-semibold text-content-primary">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-0.5 inline animate-pulse" />
                <span>by</span>
                <span className="text-brand-600 ml-1">Muzzammil Malik</span>
              </div>

              <div className="space-y-2 text-xs text-content-secondary">
                <a
                  href="mailto:160425733134@mjcollege.ac.in"
                  className="flex items-center gap-2 hover:text-brand-600 transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-content-muted group-hover:text-brand-600" />
                  <span className="font-mono">160425733134@mjcollege.ac.in</span>
                </a>

                <a
                  href="tel:+919849931637"
                  className="flex items-center gap-2 hover:text-brand-600 transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 text-content-muted group-hover:text-brand-600" />
                  <span>+91 9849931637</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/md-muzzammil-malik-737056364"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium transition-colors pt-1"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>linkedin.com/in/md-muzzammil-malik</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-muted">
          <p>© {new Date().getFullYear()} StudyZone MJCET. Open learning portal for student academic excellence.</p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All 11 First & Second Year Subjects Active</span>
            </div>

            <span className="text-slate-300">•</span>

            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Admin CMS</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
