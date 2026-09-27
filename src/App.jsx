import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProfileModalProvider from './components/ProfileModalProvider.jsx'
import Home from './pages/Home.jsx'

// Everything except the landing page is split out of the initial bundle.
const About = lazy(() => import('./pages/About.jsx'))
const Experience = lazy(() => import('./pages/Experience.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const ProjectPage = lazy(() => import('./pages/ProjectPage.jsx'))
const TechStack = lazy(() => import('./pages/TechStack.jsx'))
const CaseStudies = lazy(() => import('./pages/CaseStudies.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Resume = lazy(() => import('./pages/Resume.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function RouteFallback() {
  return (
    <div className="grid min-h-[70svh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-flame" />
        <p className="font-mono text-label tracking-[0.24em] text-ink-mute uppercase">Loading</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ProfileModalProvider>
        {/* Layout renders <Outlet />, so lazy pages stream inside the shell. */}
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<ProjectPage />} />
              <Route path="/tech-stack" element={<TechStack />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ProfileModalProvider>
    </BrowserRouter>
  )
}


