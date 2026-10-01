'use client';

import { useRef } from 'react';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  completedAt: string;
}

export function Certificate({ userName, courseTitle, completedAt }: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // Simple download as text file (you can enhance this with html2canvas for PDF)
    const element = certRef.current;
    if (!element) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Certificate</title>');
    printWindow.document.write('<style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;}.cert{border:10px double #6b46c1;padding:60px;margin:20px;}.title{font-size:48px;color:#6b46c1;margin-bottom:20px;}.name{font-size:36px;margin:30px 0;}.course{font-size:24px;color:#4a5568;}.date{font-size:18px;color:#718096;margin-top:40px;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <div ref={certRef} className="bg-gradient-to-br from-purple-900 via-gray-900 to-purple-900 border-8 border-double border-purple-500 p-12 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-5xl font-bold text-purple-400 mb-6">Certificate of Completion</h1>
        <p className="text-xl text-gray-300 mb-4">This is to certify that</p>
        <h2 className="text-4xl font-bold text-white mb-6">{userName}</h2>
        <p className="text-xl text-gray-300 mb-4">has successfully completed the course</p>
        <h3 className="text-3xl font-bold text-purple-400 mb-6">{courseTitle}</h3>
        <p className="text-lg text-gray-400">
          Completed on {new Date(completedAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="mt-12 text-sm text-gray-500">
          Theocode Academy
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold"
      >
        📥 Download Certificate
      </button>
    </div>
  );
}