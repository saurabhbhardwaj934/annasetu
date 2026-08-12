
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Protected from "./components/Protected.jsx";
import { Empty } from "./components/ui.jsx";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import DonationDetail from "./pages/DonationDetail.jsx";
import PostDonation from "./pages/PostDonation.jsx";
import MyDonations from "./pages/MyDonations.jsx";
import MyClaims from "./pages/MyClaims.jsx";
import Impact from "./pages/Impact.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NotFound() {
  return (
    <div className="container page">
      <Empty
        icon="bowl"
        title="404 — Yeh rasta nahi mila"
        sub="Galat URL, ya page move ho gaya."
      />
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />

      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/donations/:id" element={<DonationDetail />} />
          <Route path="/impact" element={<Impact />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/post"
            element={
              <Protected>
                <PostDonation />
              </Protected>
            }
          />

          <Route
            path="/my-donations"
            element={
              <Protected>
                <MyDonations />
              </Protected>
            }
          />

          <Route
            path="/my-claims"
            element={
              <Protected>
                <MyClaims />
              </Protected>
            }
          />

          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
