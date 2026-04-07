import React, { useEffect } from 'react';

export const EventLandingPage: React.FC = () => {
  useEffect(() => {
    // Redirect the user directly to the static HTML page we copied into the public folder
    window.location.href = '/event.html';
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <div className="animate-pulse text-med-terracotta">
        Preparing your event details...
      </div>
    </div>
  );
};
