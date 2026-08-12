import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { Icon } from "../components/ui.jsx";
import { num } from "../utils/format.js";

const STEPS = [
  {
    n: "01",
    icon: "store",
    title: "Surplus post karo",
    text: "Restaurant ya ghar — bacha hua khana, meals count aur pickup time ke saath post karo. 1 minute ka kaam.",
  },
  {
    n: "02",
    icon: "map",
    title: "Paas wale claim karein",
    text: "Geo-search se NGOs/volunteers ko aapki donation dikhti hai — claim, pickup, distribute. Sab tracked.",
  },
  {
    n: "03",
    icon: "heart",
    title: "Impact dikhta hai",
    text: "Har delivered meal count hota hai — kitna khana bacha, kitna CO2 save hua. Pura report live.",
  },
];

const FEATURES = [
  { icon: "pin", title: "Geo matching", text: "2dsphere index — donations within X km, turant." },
  { icon: "shield", title: "No double-claim", text: "Atomic claim lock — ek donation ek hi claimer ko." },
  { icon: "clock", title: "Auto-expiry (TTL)", text: "Pickup window khatam → Atlas khud unclaimed donation delete karta hai." },
  { icon: "trend", title: "Live impact", text: "Aggregation pipelines — meals rescued, CO2 saved, monthly charts." },
  { icon: "zap", title: "Status tracking", text: "Available → Claimed → Picked up → Delivered. Har step time-stamped." },
  { icon: "phone", title: "Direct coordination", text: "Donor ka phone number claimer ko milta hai — no middleman." },
];

export default function Home() {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    api("/impact", { auth: false }).then(setImpact).catch(() => {});
  }, []);

  const stats = [
    { icon: "bowl", value: impact ? num(impact.meals) + "+" : "—", label: "Meals rescued" },
    { icon: "leaf", value: impact ? num(impact.kgSaved) + " kg" : "—", label: "Food saved" },
    { icon: "trend", value: impact ? num(impact.co2SavedKg) + " kg" : "—", label: "CO₂ avoided" },
    { icon: "users", value: impact ? num(impact.activeDonations) : "—", label: "Active donations" },
  ];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-in">
          <div className="hero-pill">
            <Icon name="zap" size={14} />
            India's surplus food rescue network
          </div>
          <h1>
            Surplus khana.
            <br />
            <span className="hero-brand">Bhookh nahi.</span>
          </h1>
          <p>
            Har din hazaron meals waste hote hain, jabki paas mein hi log bhookhe
            hain. Annasetu restaurants ko NGOs aur volunteers se jodta hai —
            ek click mein bacha hua khana, sahi jagah.
          </p>

          <div className="hero-actions">
            <Link to="/feed" className="btn btn-primary btn-lg">
              <Icon name="search" size={17} />
              Find food near me
            </Link>
            <Link to="/post" className="btn btn-light btn-lg">
              <Icon name="store" size={17} />
              Post surplus
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ── */}
      <section className="container stats">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <span className="stat-icon">
              <Icon name={s.icon} size={20} />
            </span>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="container section">
        <h2 className="section-title">Kaise kaam karta hai?</h2>
        <p className="section-sub">Teen steps. Zero waste.</p>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="card step-card">
              <div className="step-top">
                <span className="step-num">{s.n}</span>
                <span className="feat-icon">
                  <Icon name={s.icon} size={21} />
                </span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section alt">
        <div className="container">
          <h2 className="section-title">Database-powered, waste-proof</h2>
          <p className="section-sub">Real MongoDB Atlas features — sirf UI nahi.</p>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="card feat">
                <span className="feat-icon">
                  <Icon name={f.icon} size={21} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="container section">
        <h2 className="section-title">Sabke liye jagah hai</h2>
        <p className="section-sub">Ek platform, teen roles.</p>
        <div className="feat-grid">
          <div className="card feat">
            <span className="feat-icon"><Icon name="store" size={21} /></span>
            <h3>Restaurant / Donor</h3>
            <p>Bacha hua khana post karo, pickup window set karo, apna impact dekho. Tax benefit ka record bhi milega. 😉</p>
          </div>
          <div className="card feat">
            <span className="feat-icon"><Icon name="heart" size={21} /></span>
            <h3>NGO</h3>
            <p>Paas ki donations claim karo, apne network mein distribute karo, monthly rescue report banao.</p>
          </div>
          <div className="card feat">
            <span className="feat-icon"><Icon name="users" size={21} /></span>
            <h3>Volunteer</h3>
            <p>Pickup + delivery karo, meals rescued ka apna personal score dekho. Change starts at home.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container section">
        <div className="cta-band">
          <div>
            <h2>Ek plate bhi waste nahi honi chahiye 🍲</h2>
            <p>
              Aaj hi register karo — restaurant ho ya volunteer, apna setu banao
              aur rescue count shuru karo.
            </p>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Join Annasetu
            </Link>
            <Link to="/impact" className="btn btn-light btn-lg">
              See impact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
