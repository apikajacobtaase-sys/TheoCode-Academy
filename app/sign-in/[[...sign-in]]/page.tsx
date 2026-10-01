import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-sm normal-case',
            card: 'bg-gray-800 border border-gray-700 shadow-2xl',
            headerTitle: 'text-white text-2xl font-bold',
            headerSubtitle: 'text-gray-400',
            socialButtonsBlockButton: 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition',
            formFieldInput: 'bg-gray-900 border-gray-700 text-white focus:border-purple-500',
            formFieldLabel: 'text-gray-300',
            footerActionLink: 'text-purple-400 hover:text-purple-300'
          }
        }}
      />
    </div>
  );
}