// src/components/Layout.jsx
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";

function Layout({ children }) {
  return (
    <div className="layout-grid">
      <Sidebar />
      <div className="feed">{children}</div>
      <RightPanel />
    </div>
  );
}

export default Layout;