import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScrollProgress from '../components/motion/ScrollProgress'
import { motion } from 'motion/react'

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
      {/* Each page fades in as it opens */}
      <motion.main
        id="main"
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  )
}

export default MainLayout
