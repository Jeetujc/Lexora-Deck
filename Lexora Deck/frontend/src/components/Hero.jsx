import React from 'react';
import { ArrowRight, Play, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              The Deck That Redefines Learning
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Elevate Your Mind
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Effortlessly
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Lexora Deck brings you curated flashcards across coding, finance, literature, and more.
              Learn anything, anytime — with elegance and ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* <button className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button> */}
              {/* <button className="group bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold border border-gray-300 transition-all duration-200 flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button> */}
            </div>

            {/* Stats */}
            
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="h-4 bg-gray-200 rounded mb-4">
                  
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4">
                  <p className='flex'></p>
                </div>
                <div className="flex space-x-2">
                  <div className="h-3 bg-blue-200 rounded flex-1"></div>
                  <div className="h-3 bg-purple-200 rounded flex-1"></div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Star className="w-8 h-8 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-lg shadow-lg animate-pulse"></div>
            </div>

            {/* Background Shapes */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;