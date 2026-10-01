import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - TheCode Academy',
  description: 'Terms of Service for TheCode Academy platform',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        
        <Link href="/" className="text-green-400 hover:text-green-300 text-sm mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        
        <p className="text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose prose-invert max-w-none space-y-8">
          
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using TheCode Academy ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Platform.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. User Accounts</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              To access certain features, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Providing accurate and complete registration information</li>
            </ul>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Acceptable Use</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Platform for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              All content on the Platform, including courses, challenges, and materials, is owned by TheCode Academy 
              or its licensors. You may not reproduce, distribute, or create derivative works without explicit permission.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. User Content</h2>
            <p className="text-gray-300 leading-relaxed">
              By submitting content (code, messages, reviews), you grant us a non-exclusive, worldwide license to use, 
              display, and distribute your content on the Platform. You retain ownership of your content.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Certificates & Achievements</h2>
            <p className="text-gray-300 leading-relaxed">
              Certificates and badges earned on the Platform are for educational purposes and personal achievement. 
              They do not constitute official accreditation or certification from any educational institution.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these terms 
              or for any other reason deemed appropriate by our team.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-300 leading-relaxed">
              The Platform is provided "as is" without warranties of any kind. We do not guarantee that the Platform 
              will be error-free, secure, or available at all times.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, TheCode Academy shall not be liable for any indirect, incidental, 
              special, or consequential damages arising from your use of the Platform.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update these terms from time to time. Continued use of the Platform after changes constitutes 
              acceptance of the new terms. We will notify users of significant changes via email or platform notification.
            </p>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about these Terms of Service, please contact us at:{' '}
              <a href="mailto:legal@thecodeacademy.com" className="text-green-400 hover:text-green-300 transition">
                legal@thecodeacademy.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}