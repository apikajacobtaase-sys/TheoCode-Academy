'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: string;
  instructorName?: string;
}

export default function Certificate({ 
  userName, 
  courseTitle, 
  certificateNumber, 
  issuedAt,
  instructorName = 'TheCode Academy'
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certRef.current) return;

    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificate-${certificateNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to download certificate');
    }
  };

  return (
    <div className="space-y-4">
      {/* Certificate Preview */}
      <div
        ref={certRef}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-8 border-double border-yellow-500 p-12 text-center relative overflow-hidden"
        style={{ width: '1000px', height: '700px' }}
      >
        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-500"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-500"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-500"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-500"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <p className="text-yellow-500 text-sm uppercase tracking-widest mb-4">Certificate of Completion</p>
          <h1 className="text-5xl font-bold text-white mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            TheCode Academy
          </h1>
          
          <p className="text-gray-400 text-lg mb-2">This is to certify that</p>
          <h2 className="text-4xl font-bold text-white mb-6">{userName}</h2>
          
          <p className="text-gray-400 text-lg mb-2">has successfully completed the course</p>
          <h3 className="text-3xl font-bold text-green-400 mb-8">{courseTitle}</h3>
          
          <div className="flex items-center gap-12 mt-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Issued</p>
              <p className="text-white font-bold">{new Date(issuedAt).toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Certificate No.</p>
              <p className="text-white font-bold font-mono text-sm">{certificateNumber}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Instructor</p>
              <p className="text-white font-bold">{instructorName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadCertificate}
        className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-lg"
      >
        📥 Download Certificate (PDF)
      </button>
    </div>
  );
}