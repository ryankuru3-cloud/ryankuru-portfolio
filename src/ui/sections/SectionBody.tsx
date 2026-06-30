import { SECTIONS } from '../../config/content'
import type { PdfContent, VideoContent, ContactContent, ProjectContent, EvolutionContent, BioContent, DecaContent, IconContent, GiftedContent } from '../../config/content'
import PdfSection from './PdfSection'
import VideoSection from './VideoSection'
import ContactSection from './ContactSection'
import ProjectSection from './ProjectSection'
import ProfessionalEvolution from '../../components/ProfessionalEvolution/ProfessionalEvolution'
import AboutBio from '../../components/AboutBio/AboutBio'
import DecaSection from '../../components/DecaSection/DecaSection'
import IconSection from '../../components/IconSection/IconSection'
import GiftedSection from '../../components/GiftedSection/GiftedSection'

/** Renders the right section layout for a section id, keyed by its `kind`. */
export default function SectionBody({ id }: { id: string }) {
  const s = SECTIONS[id]
  if (!s) return null
  switch (s.kind) {
    case 'pdf':
      return <PdfSection content={s.content as PdfContent} title={s.title} />
    case 'video':
      return <VideoSection content={s.content as VideoContent} />
    case 'contact':
      return <ContactSection content={s.content as ContactContent} />
    case 'project':
      return <ProjectSection content={s.content as ProjectContent} />
    case 'evolution':
      return <ProfessionalEvolution content={s.content as EvolutionContent} />
    case 'bio':
      return <AboutBio content={s.content as BioContent} />
    case 'deca':
      return <DecaSection content={s.content as DecaContent} />
    case 'icon':
      return <IconSection content={s.content as IconContent} />
    case 'gifted':
      return <GiftedSection content={s.content as GiftedContent} />
    default:
      return null
  }
}
