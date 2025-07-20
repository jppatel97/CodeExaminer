import React from 'react';
import { FaLock, FaChartBar, FaClock, FaUserGraduate, FaChalkboardTeacher, FaMobile, FaCode } from 'react-icons/fa';

const Features = () => {
  const features = [
    {
      icon: <FaLock className="w-8 h-8 text-purple-600" />,
      title: "Secure Examination",
      description: "Advanced security measures to prevent cheating and ensure exam integrity"
    },
    {
      icon: <FaChartBar className="w-8 h-8 text-purple-600" />,
      title: "Instant Results",
      description: "Automated grading and immediate feedback for objective questions"
    },
    {
      icon: <FaClock className="w-8 h-8 text-purple-600" />,
      title: "Flexible Timing",
      description: "Set custom duration and schedule for each examination"
    },
    {
      icon: <FaUserGraduate className="w-8 h-8 text-purple-600" />,
      title: "Student Analytics",
      description: "Detailed performance analysis and progress tracking"
    },
    {
      icon: <FaChalkboardTeacher className="w-8 h-8 text-purple-600" />,
      title: "Teacher Dashboard",
      description: "Comprehensive tools for exam creation and management"
    },
    {
      icon: <FaMobile className="w-8 h-8 text-purple-600" />,
      title: "Mobile Responsive",
      description: "Access exams seamlessly across all devices"
    },
    {
      icon: <FaCode className="w-8 h-8 text-purple-600" />,
      title: "Collaborative Code Editor",
      description: "Real-time collaborative code editing for multiple languages with syntax highlighting."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Platform Features
          </h1>
          <p className="text-xl text-gray-600">
            Discover what makes CodeExaminer stand out
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center">
              {feature.icon}
              <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{feature.title}</h2>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">For Teachers</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Easy exam creation and management</li>
                <li>Automated grading saves time</li>
                <li>Detailed performance analytics</li>
                <li>Question bank management</li>
                <li>Customizable exam settings</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">For Students</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>User-friendly interface</li>
                <li>Instant results and feedback</li>
                <li>Progress tracking</li>
                <li>Mobile-friendly access</li>
                <li>Practice tests available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features; 