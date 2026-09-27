import Hero from './home/Hero.jsx'
import SelectedWork from './home/SelectedWork.jsx'
import Capabilities, { Approach } from './home/Capabilities.jsx'
import Cta from './home/Cta.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <Capabilities />
      <Approach />
      <Cta />
    </>
  )
}
