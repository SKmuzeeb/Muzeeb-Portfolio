import Reveal from '../components/ui/Reveal.jsx'
import HeroObject from '../components/HeroObject.jsx'
import DiagramImage from '../components/ui/DiagramImage.jsx'
import ArchitectureFlow from '../components/ArchitectureFlow.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import StackGroups from './tech/StackGroups.jsx'
import ArchitecturePatterns, { HowIBuildIntro } from './tech/ArchitecturePatterns.jsx'
import { flowNodes } from '../data/architecture.js'
import Cta from './home/Cta.jsx'

export default function TechStack() {
  return (
    <>
      <section className="bleed border-b border-line pt-(--nav-h)">
        <div className="bleed-decor" aria-hidden="true">
          <div className="grid-field absolute inset-0 opacity-30" />
          <div className="absolute -top-24 left-1/3 h-[30rem] w-[30rem] rounded-full bg-aqua/10 blur-[140px]" />
        </div>

        <div className="shell py-(--spacing-margin)">
          <HeroObject variant="gyro" />
          <SectionHeading
            kicker="Technology stack"
            title="The tools I build"
            accent="with."
            lede="Organised by the layer each technology sits in. Only what is genuinely used — there is no speculative entry here."
          />
        </div>
      </section>

      <section className="shell py-(--spacing-margin)">
        <StackGroups />
      </section>

      {/* How I build — animated request path */}
      <section className="bleed overflow-hidden py-(--spacing-margin)">
        <div className="bleed-decor" aria-hidden="true">
          <div className="grid-field absolute inset-0 opacity-20" />
          <div className="absolute top-1/3 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-flame/8 blur-[150px]" />
        </div>

        <div className="shell">
          <HowIBuildIntro />

          {/* Full shell width on purpose. The layered diagram carries 15px SVG
              labels; in a half-width column they would scale to roughly 5px. */}
          <Reveal delay={0.15}>
            <div className="mt-14">
              <ArchitectureFlow nodes={flowNodes} />
            </div>
          </Reveal>
        </div>
      </section>

      <ArchitecturePatterns />

      <section className="shell pb-(--spacing-margin)">
        <Reveal>
          <DiagramImage
            config={{
              schema: 'integration',
              seed: 'stack-integration',
              accent: 'plasma',
              title: 'Integration boundary',
              tag: 'OVERVIEW',
              sub: 'What sits outside the application',
              hub: { label: 'Application', sub: 'React.js + Node.js' },
              spokes: [
                { label: 'Microsoft Graph', sub: 'service' },
                { label: 'Google APIs', sub: 'service' },
                { label: 'Stripe', sub: 'service' },
                { label: 'Helcim', sub: 'service' },
                { label: 'AWS S3', sub: 'service' },
                { label: 'AWS Lambda', sub: 'service' },
              ],
            }}
            alt="Integration boundary diagram showing the application connected to Microsoft Graph, Google APIs, Stripe, Helcim, AWS S3 and AWS Lambda"
            ratio="16 / 9"
          />
        </Reveal>
      </section>

      <Cta />
    </>
  )
}
