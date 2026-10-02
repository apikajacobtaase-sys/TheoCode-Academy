'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// 🎯 CRITICAL: This MUST be at the very top, before the component
export const dynamic = 'force-dynamic';

function ExploreContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // ... rest of your component logic ...
  
  return (
    <div>
      {/* Your explore page UI */}
    </div>
  );
}

// 🎯 CRITICAL: Wrap the component that uses useSearchParams in Suspense
export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading explore page...</div>}>
      <ExploreContent />
    </Suspense>
  );
}