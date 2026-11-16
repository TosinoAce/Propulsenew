import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScrollProgress from '../components/motion/ScrollProgress'

// Pages are not faded in as a whole: each section animates in on its own, and the first
// thing on screen is painted straight away, which matters on slow mobile connections.
const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
