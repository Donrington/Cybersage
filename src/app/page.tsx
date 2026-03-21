import { Hero } from "@/components/Hero";
import { Narrative } from "@/components/Narrative";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { CompanyMarquee } from "@/components/CompanyMarquee";
import { ProjectBento } from "@/components/ProjectBento";
import { NetworkIntel } from "@/components/NetworkIntel";
import { TechInfrastructure } from "@/components/TechInfrastructure";
import { ContactFooter } from "@/components/ContactFooter";

export default function Home() {
  return (
    <main className="w-full">
      <Hero />
      <div id="narrative"><Narrative /></div>
      <div id="audit"><ExperienceTimeline /></div>
      <CompanyMarquee />
      <div id="bento"><ProjectBento /></div>
      <div id="intel"><NetworkIntel /></div>
      <TechInfrastructure />
      <div id="uplink"><ContactFooter /></div>
    </main>
  );
}
