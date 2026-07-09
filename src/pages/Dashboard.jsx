import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import dashboardData from "../data/dashboardData";

function Dashboard() {
  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <header className="topbar">
          <h1>Dashboard</h1>
          <p>Xin chào ông 😎</p>
        </header>

        <div className="cards">
          {dashboardData.map((item, index) => (
            <DashboardCard
              key={index}
              icon={item.icon}
              title={item.title}
              value={item.value}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;