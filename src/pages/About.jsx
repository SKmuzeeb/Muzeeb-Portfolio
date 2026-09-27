import Profile, { AboutHero, Background } from './about/Profile.jsx'
import Cta from './home/Cta.jsx'

export default function About() {
  return (
    <>
      <AboutHero />
      <Profile />
      <Background />
      <Cta />
    </>
  )
}
