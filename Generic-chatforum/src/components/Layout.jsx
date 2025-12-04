import Sidebar from "./Sidebar";
import PostList from "./Posts/PostList";
import RightPanel from "./RightPanel";
import CreatePost from "./Posts/CreatePost";

function Layout() {
  return (
    <div className="layout-grid">
      <Sidebar />

      <div className="feed">
        <CreatePost />
        
        <PostList />
      </div>

      <RightPanel />
    </div>
  );
}

export default Layout;