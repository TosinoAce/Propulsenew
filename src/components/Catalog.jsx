import CatalogCard from "./CatalogCard";
import ExploreCard from "./ExploreCard";
import Button from "./button";
import "./Catalog.css";

const Catalog = () => {
  return (
    <section id="catalogContainer">
      <p>catalog</p>
      <h2>Apartment available for your dreams</h2>
      <div id="catalogCardContainer">
        <ExploreCard />
        <CatalogCard price="#500,000" image = "/Rectangle3.png"/>
        <CatalogCard price="#400,000" image = "/Rectangle1.png"/>
        <CatalogCard price="#350,000" image = "/Rectangle5.png"/>
        <CatalogCard price="200,000" image = "/Group5.png"/>
        <CatalogCard price="#170,000" image = "/Rectangle4.png"/>
        <CatalogCard price="#550,000" image = "/Rectangle2.png"/>
        <div id="btnContainer"><Button name="VIEW MORE"/></div>
      </div>
      <img id="dollar" src="/Frame3.svg" alt="dollar sign"/>
    </section>
  );
};

export default Catalog;
