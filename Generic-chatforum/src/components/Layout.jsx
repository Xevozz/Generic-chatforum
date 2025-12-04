import Sidebar from "./Sidebar";
import PostList from "./Posts/PostList";
import RightPanel from "./RightPanel";
import CreatePost from "./Posts/CreatePost";

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