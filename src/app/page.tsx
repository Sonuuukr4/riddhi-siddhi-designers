import { Contact } from "@/components/sections/Contact";
import { DesignApproach } from "@/components/sections/DesignApproach";
import { Expertise } from "@/components/sections/Expertise";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Prologue } from "@/components/sections/Prologue";
import { SelectedProjects } from "@/components/sections/SelectedProjects";
import { Studio } from "@/components/sections/Studio";
import { Visualization } from "@/components/sections/Visualization";

/**
 * The narrative, top to bottom:
 * arrival → idea → work → capability → values → method → seeing → people → conversation.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Prologue />
      <SelectedProjects />
      <Expertise />
      <DesignApproach />
      <Process />
      <Visualization />
      <Studio />
      <Contact />
    </>
  );
}
