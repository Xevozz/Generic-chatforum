// src/pages/homePage.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import Layout from "../components/Layout";
import CreatePost from "../components/Posts/CreatePost";
import PostList from "../components/Posts/PostList";

function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState(null);

  return (
    <div>
      <Navbar
        pageTitle="Alle opslag"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onApplyAdvancedFilters={setAdvancedFilters}
      />

      <Layout>
        <CreatePost />
        <PostList searchQuery={searchQuery} advancedFilters={advancedFilters} />
      </Layout>
    </div>
  );
}

export default HomePage;