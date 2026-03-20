import { Hero } from "@/components/Hero";
import { Narrative } from "@/components/Narrative";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { CompanyMarquee } from "@/components/CompanyMarquee";
import { ProjectBento } from "@/components/ProjectBento";

export default function Home() {
  return (
    <main className="w-full">
      <Hero />
      <Narrative />
      <ExperienceTimeline />
      <CompanyMarquee />
      <ProjectBento />
    </main>
  );
}
