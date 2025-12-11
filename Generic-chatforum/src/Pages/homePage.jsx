// src/pages/homePage.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import Layout from "../components/Layout";

function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      {/* Top navigation */}
      <Navbar
        pageTitle="Alle opslag"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Selve forum-layoutet: sidebar + feed + højre panel */}
      <Layout searchQuery={searchQuery} />
    </div>
  );
}

export default HomePage;