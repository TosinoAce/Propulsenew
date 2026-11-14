import MainLayout from "./layout/MainLayout";
import Hero from "./components/home/Hero";
import Featured from "./components/home/Featured";
import HowItWorks from "./components/home/HowItWorks";
import WhyPropulse from "./components/home/WhyPropulse";
import Ambition from "./components/home/Ambition";
import Gallery from "./components/home/Gallery";
import CtaBand from "./components/CtaBand";
import { useProperties } from "./lib/useProperties";

function App() {
  const listings = useProperties();

  return (
    <MainLayout>
      <Hero preview={listings.properties[0]} />
      <Featured {...listings} />
      <HowItWorks />
      <WhyPropulse />
      <Ambition />
      <Gallery />
      <CtaBand />
    </MainLayout>
  );
}

export default App;
