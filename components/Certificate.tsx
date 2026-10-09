'use client';

import Image from 'next/image';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: string;
  instructorName: string;
}

export default function Certificate({ 
  userName, 
  courseTitle, 
  certificateNumber, 
  issuedAt, 
  instructorName 
}: CertificateProps) {
  return (
    // 🎯 RESPONSIVE CONTAINER: Full width on mobile, max-width on desktop
    <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-white to-gray-100 text-gray-900 rounded-xl shadow-2xl border-4 border-double border-yellow-600/50 p-6 md:p-12 relative overflow-hidden">
      
      {/* Decorative Corner Accents */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-yellow-600 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-yellow-600 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-yellow-600 rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-yellow-600 rounded-br-lg" />

      <div className="text-center space-y-4 md:space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-yellow-700 font-bold tracking-[0.2em] uppercase text-xs md:text-sm">
            Certificate of Completion
          </p>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
            The Code Academy
          </h1>
        </div>

        {/* Body */}
        <div className="space-y-3 md:space-y-4">
          <p className="text-gray-600 text-sm md:text-base italic">
            This is to certify that
          </p>
          
          {/* 🎯 RESPONSIVE NAME: Scales down on mobile */}
          <h2 className="text-2xl md:text-4xl font-bold text-yellow-700 border-b-2 border-yellow-600/30 pb-2 inline-block px-4">
            {userName}
          </h2>
          
          <p className="text-gray-600 text-sm md:text-base">
            has successfully completed the course
          </p>
          
          {/* 🎯 RESPONSIVE COURSE TITLE */}
          <h3 className="text-xl md:text-3xl font-bold text-gray-900 px-2">
            "{courseTitle}"
          </h3>
        </div>

        {/* Footer / Signatures */}
        <div className="pt-6 md:pt-10 grid grid-cols-2 gap-4 md:gap-12 text-center">
          <div className="space-y-2">
            <div className="h-px bg-gray-400 w-2/3 mx-auto" />
            <p className="text-xs md:text-sm font-bold text-gray-700">{instructorName}</p>
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">Instructor</p>
          </div>
          
          <div className="space-y-2">
            <div className="h-px bg-gray-400 w-2/3 mx-auto" />
            <p className="text-xs md:text-sm font-bold text-gray-700">
              {new Date(issuedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">Date Issued</p>
          </div>
        </div>

        {/* Certificate Number */}
        <div className="pt-4 md:pt-6">
          <p className="text-[10px] md:text-xs text-gray-400 font-mono">
            Certificate ID: {certificateNumber}
          </p>
        </div>
      </div>
    </div>
  );
}