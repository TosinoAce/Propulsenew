import MainLayout from "./layout/MainLayout";
import Seo from "./components/Seo";
import Hero from "./components/home/Hero";
import Featured from "./components/home/Featured";
import HowItWorks from "./components/home/HowItWorks";
import WhyPropulse from "./components/home/WhyPropulse";
import Ambition from "./components/home/Ambition";
import Gallery from "./components/home/Gallery";
import CtaBand from "./components/CtaBand";
import { getListingStates, useProperties } from "./lib/useProperties";

function App() {
  const listings = useProperties();

  return (
    <MainLayout>
      <Seo />
      <Hero
        slides={listings.properties.filter((listing) => listing.status !== "sold" && listing.propertyImage).slice(0, 4)}
        states={getListingStates(listings.properties)}
      />
      <Featured {...listings} />
      <HowItWorks properties={listings.properties} loading={listings.loading} />
      <WhyPropulse />
      <Ambition />
      <Gallery />
      <CtaBand />
    </MainLayout>
  );
}

export default App;
