

const CatalogCard = (props) => {
  return (
    <div>
      <div className="catalogCards">
        <div className="amount">
            <span>{props.price}</span>
        </div>
        <img src={props.image} alt="propety image"/>
        <div className="catalogArrow">
            <img src="/Vector.svg" alt="arrow up"/>
        </div>
    </div>
    <p className="apartmentName">Astalavista residence</p>
    <span className="apartmentLocation">Basin, Kwara State</span>
    </div>
    
  )
}

export default CatalogCard