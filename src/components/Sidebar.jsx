import { Link } from "react-router-dom";


function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>🚗 ToyotaSureHub</h2>

     <Link to="/">
  <button>📋 Dashboard</button>
</Link>

      <Link to="/cars">
  <button>🚗 Quản lý xe</button>
</Link>

      <button>👥 Khách hàng</button>
      <button>🤖 AI Đăng bài</button>
      <button>📊 Báo cáo</button>
      <button>⚙️ Cài đặt</button>
    </aside>
  );
}

export default Sidebar;