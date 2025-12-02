import Sidebar from "./Sidebar";
import PostList from "./Posts/PostList";
import RightPanel from "./RightPanel";

function Layout() {
  return (
    <div className="layout-grid">
      <Sidebar />
      <div className="feed">
        <PostList />
      </div>
      <RightPanel />
    </div>
  );
}

export default Layout;