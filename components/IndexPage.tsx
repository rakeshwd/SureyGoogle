import React from 'react';
import { BriefcaseIcon, CheckCircleIcon, ScaleIcon } from './icons';

interface IndexPageProps {
  onNavigateToAuth: () => void;
}

const IndexPage: React.FC<IndexPageProps> = ({ onNavigateToAuth }) => {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="text-center pt-12 sm:pt-20">
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Unlock Your Career Potential
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-400">
          Go beyond your resume. Showcase the behavioral traits that top employers are actively seeking and land your dream, high-paying job.
        </p>
        <div className="mt-8">
          <button
            onClick={onNavigateToAuth}
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg transform hover:scale-105 transition-transform duration-200"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Why Traits Matter Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Why Your Behavior is Your Biggest Asset</h2>
          <p className="mt-3 max-w-3xl mx-auto text-md text-slate-500 dark:text-slate-400">In today's competitive job market, how you work is as important as what you know. Here’s why focusing on your behavioral traits is crucial.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
            <BriefcaseIcon className="h-12 w-12 mx-auto text-orange-500" />
            <h3 className="mt-4 text-xl font-semibold">Access High-Paying Jobs</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Companies pay a premium for candidates with proven leadership, teamwork, and problem-solving skills. Our assessments help you demonstrate your value.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
            <ScaleIcon className="h-12 w-12 mx-auto text-orange-500" />
            <h3 className="mt-4 text-xl font-semibold">Stand Out from the Crowd</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Technical skills get you the interview; behavioral traits get you the job. We provide the tools to highlight your unique soft skills and professional character.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
            <CheckCircleIcon className="h-12 w-12 mx-auto text-orange-500" />
            <h3 className="mt-4 text-xl font-semibold">Fuel Your Career Growth</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Understanding and articulating your behavioral strengths is not just for landing a job—it's the key to long-term success and advancement.</p>
          </div>
        </div>
      </section>

      {/* How to Succeed Section */}
      <section className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-8 sm:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Master Your Assessment</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Your final score is a reflection of your focus and honesty. Here’s how to ensure your results accurately represent your capabilities.</p>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold">Focus is Key</h4>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Each question is designed to understand your unique approach. Read carefully and answer thoughtfully to reflect your true self. Your concentration directly impacts the accuracy of your profile.</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">The Power of Your Score</h4>
              <p className="mt-1 text-slate-600 dark:text-slate-400">A high USCORE is a clear signal to recruiters that you possess desired competencies. It validates your skills and can open doors to more senior, higher-paying opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center pb-12 sm:pb-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white" style={{fontFamily: "'Playfair Display', serif"}}>Ready to Prove Your Potential?</h2>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Take the first step towards a more rewarding career. Create your account, complete your first assessment, and let your strengths shine.
        </p>
        <div className="mt-8">
          <button
            onClick={onNavigateToAuth}
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg transform hover:scale-105 transition-transform duration-200"
          >
            Sign Up and Get Certified
          </button>
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
