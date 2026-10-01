'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CertificateViewPage() {
  const { id: certId } = useParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certId) {
      fetchCertificate();
    }
  }, [certId]);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/certificates/${certId}`);
      if (!res.ok) {
        setError('Certificate not found');
        return;
      }
      const data = await res.json();
      setCertificate(data.certificate);
    } catch (error) {
      setError('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading certificate...</div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <div className="text-6xl mb-4">📜</div>
        <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
        <p className="text-gray-400 mb-6">{error || 'This certificate does not exist.'}</p>
        <Link href="/my-certificates" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
          ← Back to My Certificates
        </Link>
      </div>
    );
  }

  const issueDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-black text-white">
      
      {/* Action Bar (Hidden when printing) */}
      <div className="print:hidden bg-gray-900 border-b border-gray-800 p-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/my-certificates" className="text-green-400 hover:text-green-300 transition">
            ← Back to My Certificates
          </Link>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition flex items-center gap-2"
          >
            🖨️ Download / Print
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div className="container mx-auto max-w-6xl p-4 sm:p-8 print:p-0 print:max-w-none">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-8 border-double border-green-500 rounded-2xl p-8 sm:p-16 relative overflow-hidden shadow-2xl">
          
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                  <span className="text-white font-bold text-4xl">T</span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">
                Certificate of Completion
              </h1>
              <p className="text-gray-400 text-lg">TheoCode Academy</p>
            </div>

            {/* Recipient */}
            <div className="text-center mb-12">
              <p className="text-gray-400 text-lg mb-4">This is to certify that</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 border-b-2 border-green-500 pb-4 inline-block">
                {certificate.full_name}
              </h2>
              {certificate.username && (
                <p className="text-gray-400 text-sm">@{certificate.username}</p>
              )}
            </div>

            {/* Course */}
            <div className="text-center mb-12">
              <p className="text-gray-400 text-lg mb-4">has successfully completed the course</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mb-4">
                {certificate.course_title}
              </h3>
              <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                {certificate.course_description}
              </p>
            </div>

            {/* Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-700">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Issue Date</p>
                <p className="text-white font-bold">{issueDate}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Certificate ID</p>
                <p className="text-green-400 font-mono text-sm">{certificate.certificate_number}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Verified By</p>
                <p className="text-white font-bold">TheoCode Academy</p>
              </div>
            </div>

            {/* Verification Note */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                This certificate can be verified at thecodeacademy.com/verify/{certificate.certificate_number}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
        }
      `}</style>
    </main>
  );
}