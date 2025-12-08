// src/pages/homePage.jsx

import Navbar from "../components/Navbar";
import Layout from "../components/Layout";

function HomePage() {
  return (
    <div>
      {/* Top navigation */}
      <Navbar />

      {/* Selve forum-layoutet: sidebar + feed + højre panel */}
      <Layout />
    </div>
  );
}

export default HomePage;