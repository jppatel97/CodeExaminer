import React from 'react';
import { 
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const stats = [
    { number: "10,000+", label: "Educators Worldwide" },
    { number: "50,000+", label: "Students" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <HeartIcon className="h-4 w-4" />
              <span>Built with passion for education</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CodeExaminer</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing the way educators and students interact with technology, 
              creating a seamless bridge between traditional learning and modern digital tools.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                CodeExaminer is dedicated to transforming education through innovative technology. 
                We believe that every student deserves access to high-quality, interactive learning 
                experiences that prepare them for the digital future.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform combines the power of collaborative coding with secure online examinations, 
                creating a comprehensive solution for modern educational institutions.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <StarIcon className="h-5 w-5" />
                  <span className="font-semibold">Trusted by educators worldwide</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Cutting-edge technology with proven results</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Dedicated support team available 24/7</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Continuous innovation and updates</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Compliance with educational standards</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of educators who are already using CodeExaminer to enhance their teaching
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Get Started Free
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 