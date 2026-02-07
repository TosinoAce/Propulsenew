import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const MainLayout = ({children}) => {
  return (
    <>
    <Navbar />
    <div>{children}</div>
    <Footer />
    </>
  )
}

export default MainLayout