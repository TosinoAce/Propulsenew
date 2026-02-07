import Cover from "./components/Cover";
import Services from "./components/Services";
import Catalog from "./components/Catalog";
import Ambition from "./components/Ambition";
import Curation from "./components/Curation";
import MainLayout from "./layout/MainLayout";
function App() {
  return (
    <MainLayout>
      <Cover />
      <Services />
      <Catalog />
      <Ambition />
      <Curation/>
    </MainLayout>
  );
}

export default App;
