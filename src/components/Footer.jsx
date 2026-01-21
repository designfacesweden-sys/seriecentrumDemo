import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo-section">
            <img src="/images/mtgfooter.png" alt="Magic The Gathering" className="footer-logo-image" id="footer-logo-img" />
          </div>
          <div className="footer-nav-columns">
            <div className="footer-nav-column">
              <h4 className="footer-nav-heading">Information</h4>
              <ul className="footer-nav-list">
                <li><Link to="/kontakta-oss" className="footer-nav-link">Karta / Hitta oss</Link></li>
                <li><Link to="/kontakta-oss" className="footer-nav-link">Kontakta oss</Link></li>
                <li><a href="#" className="footer-nav-link">Beställningsvilkor</a></li>
                <li><Link to="/leveransinfo" className="footer-nav-link">Fraktkostnader</Link></li>
                <li><a href="#" className="footer-nav-link">FNM & Turneringar</a></li>
                <li><a href="#" className="footer-nav-link">Marknader 2025</a></li>
                <li><Link to="/skickgraderingar" className="footer-nav-link">Skickgraderingar</Link></li>
              </ul>
            </div>
            <div className="footer-nav-column">
              <h4 className="footer-nav-heading">Övrigt</h4>
              <ul className="footer-nav-list">
                <li><a href="#" className="footer-nav-link">Översiktskarta</a></li>
              </ul>
            </div>
            <div className="footer-nav-column">
              <h4 className="footer-nav-heading">Ditt konto</h4>
              <ul className="footer-nav-list">
                <li><a href="#" className="footer-nav-link">Ditt konto</a></li>
                <li><a href="#" className="footer-nav-link">Orderhistorik</a></li>
                <li><a href="#" className="footer-nav-link">Nyhetsbrev</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
