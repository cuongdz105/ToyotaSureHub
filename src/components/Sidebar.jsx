import { Link } from "react-router-dom";


function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>🚗 ToyotaSureHub</h2>

      <Link to="/">
        <Link to="/">
  <button>📋 Dashboard</button>
</Link>
      </Link>

      <Link to="/cars">
        <Link to="/cars">
  <button>🚗 Quản lý xe</button>
</Link>
      </Link>

      <button>👥 Khách hàng</button>
      <button>🤖 AI Đăng bài</button>
      <button>📊 Báo cáo</button>
      <button>⚙️ Cài đặt</button>
    </aside>
  );
}

export default Sidebar;