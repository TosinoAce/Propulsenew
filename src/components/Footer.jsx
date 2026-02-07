import { Link } from "react-router-dom"
import "./Footer.css"
const Footer = () => {
  return (
    <footer>
        <div className="footerLinks">
            <ul>
                <Link to="/contact"><li>Mobile app</li></Link>
                <Link to="/contact"><li>Community</li></Link>
            </ul>
            <p>Propulse</p>
            <ul>
                <Link to="/contact"><li>Contact Us</li></Link>
                <Link to="/contact"><li>Blog</li></Link>
            </ul>
        </div>
        <div className="footerSocials">
            <img src="/Social4.svg" alt="Facebook"/>
            <img src="/Social1.svg" alt="Instagram"/>
            <img src="/Social3.svg" alt="X or Twitter"/>
            <img src="/Social2.svg" alt="Pinterest"/>
        </div>
        <p>© Propulse, Inc. 2025 Get Comfort With Reliabilty</p>
    </footer>
  )
}

export default Footer