'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Route-level error boundary: a crash in one page shows this instead of a blank screen.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[page error]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#222222] mb-3">Something went wrong</h1>
        <p className="text-[#666666] mb-6">
          This page could not be loaded. Please try again — if the problem continues, contact us on WhatsApp or call our sales team.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-[#006DA8] text-white font-semibold hover:bg-[#005F92] cursor-pointer"
          >
            Try again
          </button>
          <Link href="/" className="px-5 py-2.5 rounded-lg border border-[#E0E0E0] text-[#222222] font-semibold hover:bg-[#F5F5F5]">
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
