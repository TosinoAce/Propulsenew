import AboutHero from '../components/AboutHero'
import Mission from '../components/Mission'
import Team from '../components/Team'
import MainLayout from '../layout/MainLayout'
const About = () => {
  return (
    <MainLayout>
        <AboutHero />
        <Mission />
        <Team />
    </MainLayout>
  )
}

export default About