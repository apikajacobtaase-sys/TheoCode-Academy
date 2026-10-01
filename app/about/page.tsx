'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 to-black py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            Empowering the Next Generation of{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Developers
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            TheCode Academy is a revolutionary learning platform that combines AI-powered code reviews, 
            collaborative squad learning, and real-world challenges to help you master programming faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/explore" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-lg transition transform hover:scale-105">
              Start Learning Free
            </Link>
            <Link href="/squad" className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-bold text-lg transition">
              Join a Squad
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 border-y border-gray-800 bg-gray-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">5,000+</div>
              <div className="text-gray-400">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-400">Expert Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">1,000+</div>
              <div className="text-gray-400">Coding Challenges</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400">AI Code Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Why Choose TheoCode Academy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Reviews</h3>
              <p className="text-gray-400">Get instant, detailed feedback on your code from our advanced AI, helping you learn best practices in real-time.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3">Squad Collaboration</h3>
              <p className="text-gray-400">Learning is better together. Form squads, compete on leaderboards, and chat in real-time with your peers.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-3">Earn Certificates</h3>
              <p className="text-gray-400">Complete courses and challenges to earn verified certificates that you can showcase to employers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">Our Mission</h2>
            <p className="text-lg text-gray-300 text-center leading-relaxed mb-6">
              We believe that everyone deserves access to high-quality coding education. Our mission is to democratize 
              learning by combining cutting-edge AI technology with the power of community-driven collaboration.
            </p>
            <p className="text-lg text-gray-300 text-center leading-relaxed">
              Whether you're a complete beginner or an experienced developer looking to level up, TheoCode Academy 
              provides the tools, support, and community you need to succeed in today's tech-driven world.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Level Up Your Coding Skills?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building the future with TheoCode Academy.
          </p>
          <Link href="/explore" className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-xl">
            Get Started for Free →
          </Link>
        </div>
      </div>
    </main>
  );
}