import { Link } from "react-router-dom";
import { Icon } from "./ui.jsx";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo" style={{ color: "#fff" }}>
            <span className="logo-badge">
              <Icon name="bowl" size={22} />
            </span>
            Anna<span style={{ color: "#4ade80" }}>Setu</span>
          </div>
          <p className="footer-tag">
            Khaana waste nahi hota — setu ban jaata hai. Restaurants se NGOs tak,
            surplus food ka ek pakka rasta.
          </p>
        </div>
        <div>
          <h4>Platform</h4>
          <Link to="/feed">Find food</Link>
          <Link to="/post">Post donation</Link>
          <Link to="/impact">Impact dashboard</Link>
        </div>
        <div>
          <h4>Built with</h4>
          <span>MongoDB Atlas</span>
          <span>GeoJSON + TTL indexes</span>
          <span>Express · React · Node</span>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} Annasetu · Bhojan ka Setu, duniya ke liye 🍲
      </div>
    </footer>
  );
}
