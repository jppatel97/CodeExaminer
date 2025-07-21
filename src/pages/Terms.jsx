import React from 'react';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  AcademicCapIcon,
  LockClosedIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const Terms = () => {
  const sections = [
    {
      icon: DocumentTextIcon,
      title: "Acceptance of Terms",
      content: "By accessing and using CodeExaminer, you accept and agree to be bound by the terms and provision of this agreement. Your continued use of the platform constitutes acceptance of any modifications to these terms."
    },
    {
      icon: UserIcon,
      title: "User Responsibilities",
      content: "You agree to provide accurate and complete information, maintain the security of your account credentials, not share your account access with others, not engage in any unauthorized activities, and comply with all applicable laws and regulations."
    },
    {
      icon: AcademicCapIcon,
      title: "Examination Rules",
      content: "During examinations, you must complete the exam independently without assistance, not use unauthorized materials or aids, not copy or distribute examination content, complete the exam within the specified time limit, and follow all instructions provided by the examination system."
    },
    {
      icon: LockClosedIcon,
      title: "Intellectual Property",
      content: "All content, features, and functionality of CodeExaminer, including but not limited to text, graphics, logos, and software, are the exclusive property of our organization and are protected by international copyright, trademark, and other intellectual property laws."
    },
    {
      icon: ExclamationTriangleIcon,
      title: "Termination",
      content: "We reserve the right to terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
      icon: ShieldCheckIcon,
      title: "Limitation of Liability",
      content: "In no event shall CodeExaminer be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
    },
    {
      icon: ClockIcon,
      title: "Changes to Terms",
      content: "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Legal Information</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Terms of Service
        </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Please read these terms carefully before using CodeExaminer. By using our platform, you agree to these terms and conditions.
            </p>
          </div>
        </div>
            </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0">
                      <section.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {index + 1}. {section.title}
              </h2>
                    </div>
                  </div>
                  <div className="text-gray-600 leading-relaxed">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Navigation */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Navigation</h3>
                <nav className="space-y-2">
                  {sections.map((section, index) => (
                    <a
                      key={index}
                      href={`#section-${index + 1}`}
                      className="block text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
                    >
                      {index + 1}. {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Important Notice */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                  <h3 className="text-lg font-bold">Important Notice</h3>
                </div>
                <p className="text-orange-100 text-sm leading-relaxed">
                  These terms are legally binding. By using CodeExaminer, you acknowledge that you have read, understood, and agree to be bound by these terms.
                </p>
              </div>

              {/* Contact Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">legal@codeexaminer.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">+91 8799254168</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  If you have any questions about these Terms, please don't hesitate to contact us.
                </p>
              </div>
            </div>
          </div>
        </div>
            </section>

      {/* Last Updated */}
      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Last Updated</h3>
            <p className="text-gray-600 mb-6">
              These Terms of Service were last updated on July 20, 2025.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Contact Support
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
              >
                Learn More About Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms; 