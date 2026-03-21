'use client';

import { useState, useEffect } from 'react';
import { Hero } from "@/components/Hero";
import { Narrative } from "@/components/Narrative";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { ProjectBento } from "@/components/ProjectBento";
import { NetworkIntel } from "@/components/NetworkIntel";
import { TechInfrastructure } from "@/components/TechInfrastructure";
import { ContactFooter } from "@/components/ContactFooter";
import { SystemLoader } from "@/components/SystemLoader";

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Show loader only once per session
    const seen = sessionStorage.getItem('cybersage_loaded');
    if (seen) setShowLoader(false);
  }, []);

  const handleLoaderComplete = () => {
    sessionStorage.setItem('cybersage_loaded', '1');
    setShowLoader(false);
  };

  return (
    <>
      {showLoader && <SystemLoader onComplete={handleLoaderComplete} />}
      <main className="w-full">
        <Hero />
        <div id="narrative"><Narrative /></div>
        <div id="audit"><ExperienceTimeline /></div>
        <PartnerMarquee />
        <div id="bento"><ProjectBento /></div>
        <div id="intel"><NetworkIntel /></div>
        <TechInfrastructure />
        <div id="uplink"><ContactFooter /></div>
      </main>
    </>
  );
}
