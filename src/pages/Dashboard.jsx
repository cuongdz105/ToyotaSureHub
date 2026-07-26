import DashboardCard from "../components/DashboardCard";
import QuickActions from "../components/QuickActions";
import RecentActivity from "../components/RecentActivity";
import AIWidget from "../components/AIWidget";

import { getDashboardData } from "../services/dashboardService";

function Dashboard() {
  const dashboardData = getDashboardData();

  return (
    <div className="app">
      <main className="content">

        {/* Header */}
        <header className="topbar">
          <div>
            <h1>👋 Chào mừng trở lại!</h1>
            <p>Hôm nay ông muốn làm gì?</p>
          </div>
        </header>

        {/* KPI */}
        <section className="cards">
          {dashboardData.map((item, index) => (
            <DashboardCard
              key={index}
              icon={item.icon}
              title={item.title}
              value={item.value}
            />
          ))}
        </section>

        {/* Quick Actions */}
        <QuickActions />

        {/* Bottom */}
        <section className="dashboard-bottom">
          <RecentActivity />
          <AIWidget />
        </section>

      </main>
    </div>
  );
}

export default Dashboard;