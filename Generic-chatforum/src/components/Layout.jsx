import Sidebar from "./Sidebar";
import PostList from "src/posts/PostList";
import RightPanel from "src/RightPanel";
import CreatePost from "src/posts/CreatePost";

function Layout() {
  return (
    <div className="layout-grid">
      <Sidebar />
      
      <div className="feed">
        {/* Formular til at lave nyt opslag */}
        <CreatePost />

        {/* Liste med posts hentet fra Firestore */}
        <PostList />
      </div>

      <RightPanel />
    </div>
  );
}

export default Layout;