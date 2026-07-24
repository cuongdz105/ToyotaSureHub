import DashboardCard from "../components/DashboardCard";
import { getDashboardData } from "../services/dashboardService";

  function Dashboard() {

  const dashboardData = getDashboardData();


  return (
    <div className="app">
      
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