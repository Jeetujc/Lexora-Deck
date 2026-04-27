import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Shield, Rocket, Users, BookOpen, Brain, Trophy, Layers } from 'lucide-react';
import Dashboard from '../components/Dashboard';
import Achievements from '../components/Achievements';

function Home({ onPageChange }) {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      icon: "🃏",
      label: "Start Learning",
      description: "Browse flashcard decks",
      page: "flashcards",
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    {
      icon: "🧠",
      label: "Take a Quiz",
      description: "Test your knowledge",
      page: "quiz",
      color: "from-purple-500 to-pink-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
    },
    {
      icon: "🏆",
      label: "Leaderboard",
      description: "See top learners",
      page: "leaderboard",
      color: "from-yellow-500 to-orange-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
    },
    {
      icon: "👤",
      label: "My Profile",
      description: "View stats & progress",
      page: "profile",
      color: "from-green-500 to-teal-600",
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Cards',
      description: 'Gemini AI generates personalised flashcards on any topic instantly.',
    },
    {
      icon: Shield,
      title: 'Track Your Progress',
      description: 'Monitor streaks, points, and card review history in your profile.',
    },
    {
      icon: Rocket,
      title: 'Multi-Topic Quizzes',
      description: 'Choose from Japanese, Finance, Coding, Health, and more quiz topics.',
    },
    {
      icon: Users,
      title: 'Leaderboard',
      description: 'Compete with other learners and climb the global rankings.',
    },
  ];

  const featuredTopics = [
    { icon: "₹", title: "Finance", color: "bg-blue-100", cards: 10 },
    { icon: "👨🏻‍💻", title: "Coding", color: "bg-yellow-100", cards: 10 },
    { icon: "🩺", title: "Health", color: "bg-green-100", cards: 10 },
    { icon: "🇯🇵", title: "Japanese", color: "bg-red-100", cards: 10 },
    { icon: "📚", title: "Books", color: "bg-indigo-100", cards: 10 },
    { icon: "✨", title: "General", color: "bg-purple-100", cards: 10 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 25px 25px, #6366f1 2px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            {/* Personalized Welcome */}
            {user && (
              <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-6 animate-pulse">
                👋 {getGreeting()}, <span className="font-bold ml-1">{user.name?.split(' ')[0] || 'Learner'}</span>! Ready to learn?
              </div>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Elevate Your Mind
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Effortlessly
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Lexora Deck brings you AI-curated flashcards across coding, finance, literature, and more.
              Learn anything, anytime — with elegance and ease.
            </p>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {quickActions.map((action) => (
                <button
                  key={action.page}
                  onClick={() => onPageChange && onPageChange(action.page)}
                  className={`group ${action.bg} border ${action.border} rounded-2xl p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                >
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <p className={`font-semibold text-sm ${action.text}`}>{action.label}</p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Stats (only shown if user has data) */}
      <Dashboard />

      {/* Achievements (only shown if user has earned any) */}
      <Achievements />

      {/* Featured Decks / Topics */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Decks</h2>
              <p className="text-gray-600 mt-1">Explore popular topics and start learning today</p>
            </div>
            <button
              onClick={() => onPageChange && onPageChange("flashcards")}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredTopics.map((topic, index) => (
              <div
                key={index}
                onClick={() => onPageChange && onPageChange("flashcards")}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`h-20 ${topic.color} flex items-center justify-center`}>
                  <span className="text-4xl">{topic.icon}</span>
                </div>
                <div className="p-3 text-center">
                  <p className="font-semibold text-gray-800 text-sm">{topic.title}</p>
                  <p className="text-xs text-gray-500">{topic.cards} cards</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Lexora Deck?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn smarter, not harder
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-xl border ${
                    index === 1
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100 shadow-lg'
                      : 'bg-white shadow-md border-gray-100 hover:border-indigo-100'
                  } group cursor-default`}
                >
                  <div className={`mb-4 inline-flex items-center justify-center rounded-xl ${
                    index === 1 ? 'w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600' : 'w-12 h-12 bg-indigo-100'
                  }`}>
                    <Icon className={`${index === 1 ? 'w-8 h-8 text-white' : 'w-6 h-6 text-indigo-600'}`} />
                  </div>
                  <h3 className={`font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors ${index === 1 ? 'text-xl' : 'text-lg'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-gray-600 ${index === 1 ? 'text-base' : 'text-sm'}`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Motivational CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start your learning journey?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Join thousands of learners who level up their knowledge every day with Lexora Deck.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onPageChange && onPageChange("flashcards")}
              className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              🃏 Browse Flashcards
            </button>
            <button
              onClick={() => onPageChange && onPageChange("quiz")}
              className="bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400 shadow-lg"
            >
              🧠 Take a Quiz
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
