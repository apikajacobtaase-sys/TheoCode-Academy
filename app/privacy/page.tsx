import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - TheCode Academy',
  description: 'Privacy Policy for TheCode Academy platform',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        
        <Link href="/" className="text-green-400 hover:text-green-300 text-sm mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        
        <p className="text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose prose-invert max-w-none space-y-8">
          
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              TheCode Academy ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-white">Account Information:</strong> Name, email address, profile picture</li>
              <li><strong className="text-white">Learning Data:</strong> Course progress, completed challenges, certificates earned</li>
              <li><strong className="text-white">User Content:</strong> Code submissions, messages, reviews, squad communications</li>
              <li><strong className="text-white">Usage Data:</strong> Log data, device information, IP address, browser type</li>
            </ul>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Provide, maintain, and improve the Platform</li>
              <li>Personalize your learning experience</li>
              <li>Track your progress and generate certificates</li>
              <li>Send you notifications about courses, challenges, and platform updates</li>
              <li>Enable squad collaboration and messaging</li>
              <li>Respond to your comments and questions</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-white">With Your Consent:</strong> When you explicitly authorize sharing</li>
              <li><strong className="text-white">Squad Members:</strong> Your profile and progress may be visible to squad members</li>
              <li><strong className="text-white">Service Providers:</strong> Third-party services that help us operate (e.g., authentication, hosting)</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures to protect your information, including encryption, 
              secure authentication via Clerk, and regular security audits. However, no method of transmission over 
              the Internet is 100% secure.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability (receive your data in a structured format)</li>
            </ul>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies & Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
              and personalize content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Platform uses third-party services including:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li><strong className="text-white">Clerk:</strong> Authentication and user management</li>
              <li><strong className="text-white">Neon:</strong> Database hosting</li>
              <li><strong className="text-white">Vercel:</strong> Application hosting</li>
              <li><strong className="text-white">OpenAI:</strong> AI-powered code reviews</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              The Platform is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If we become aware that we have collected such information, we will 
              delete it immediately.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by 
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:{' '}
              <a href="mailto:privacy@thecodeacademy.com" className="text-green-400 hover:text-green-300 transition">
                privacy@thecodeacademy.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}