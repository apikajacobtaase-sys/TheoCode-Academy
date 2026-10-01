import Link from 'next/link';

// 🎯 Fetch top courses directly on the server for fast loading
async function getFeaturedCourses() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/courses?sort=popular`, {
      cache: 'no-store', // Always get fresh data
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses?.slice(0, 3) || []; // Get top 3
  } catch (error) {
    console.error('Failed to fetch featured courses:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredCourses = await getFeaturedCourses();

  return (
    <main className="min-h-screen bg-black text-white">
      
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-sm text-gray-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            New C++ 20 Masterclass just dropped!
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Master Modern <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              Software Development
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of developers leveling up their skills with interactive lessons, 
            real-world projects, and a supportive community.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/explore" 
              className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-green-900/20"
            >
              🚀 Explore Courses
            </Link>
            <Link 
              href="/about" 
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 rounded-xl font-bold text-lg transition"
            >
              Learn More →
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-800 pt-10">
            <div>
              <div className="text-3xl font-bold text-white">5,000+</div>
              <div className="text-sm text-gray-500 mt-1">Active Learners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-gray-500 mt-1">Expert Courses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">100+</div>
              <div className="text-sm text-gray-500 mt-1">Coding Challenges</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.9/5</div>
              <div className="text-sm text-gray-500 mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURED COURSES ==================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950/50 border-y border-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">🔥 Featured Courses</h2>
              <p className="text-gray-400">Hand-picked by our instructors to get you started.</p>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition">
              View All Courses →
            </Link>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course: any) => (
                <Link 
                  key={course.id} 
                  href={`/courses/${course.id}`}
                  className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-40 bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                    {course.category === 'Web Development' && '🌐'}
                    {course.category === 'Backend' && '⚙️'}
                    {course.category === 'Data Science' && '📊'}
                    {!course.category && '💻'}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {course.difficulty && (
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-medium">
                          {course.difficulty}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        ⏱️ {course.duration_hours || 10}h
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                      {course.description || 'Master the fundamentals and build real-world projects.'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-yellow-400">
                        ★ {course.average_rating || '4.8'} 
                        <span className="text-gray-500">({course.review_count || 0})</span>
                      </div>
                      <span className="text-gray-400">👥 {course.enrollment_count || 0} enrolled</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-gray-400 mb-4">Courses are being prepared by our instructors.</p>
              <Link href="/explore" className="text-green-400 hover:text-green-300 font-medium">
                Check back soon →
              </Link>
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/explore" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition">
              View All Courses →
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Learn With Us?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We don't just teach syntax. We build confident, job-ready developers through proven methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Project-Based Learning',
                desc: 'Build real-world applications, not just toy examples. Learn by doing.'
              },
              {
                icon: '🛡️',
                title: 'Community Squads',
                desc: 'Join study groups, collaborate on challenges, and never learn alone.'
              },
              {
                icon: '🏆',
                title: 'Gamified Progress',
                desc: 'Earn XP, climb the global leaderboard, and unlock certificates.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-green-500/30 transition duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-900">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-3xl p-10 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to start your coding journey?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of developers who are already building the future. 
              It's free to get started.
            </p>
            <Link 
              href="/explore" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-green-900/20"
            >
              Get Started for Free 🚀
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}