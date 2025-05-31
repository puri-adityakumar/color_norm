import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Color <span className="text-primary-600">Normalization</span> Tool
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build by : Group MCA006 
          </p>
          {/* <div className="flex justify-center space-x-4">
            <Link
              to="/normalise"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Learn More
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 