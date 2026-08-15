import { useNavigate } from "react-router-dom";

import DashboardCard from "../components/DashboardCard";
import QuickActions from "../components/QuickActions";
import RecentActivity from "../components/RecentActivity";
import AIWidget from "../components/AIWidget";

import { getDashboardData } from "../services/dashboardService";
import PriorityWorkPanel from "../components/PriorityWorkPanel";
import { getTodayWorkItems } from "../services/dashboardReminderService";

function Dashboard() {
    const navigate = useNavigate();

    const dashboardData =
        getDashboardData();

    const workItems =
        getTodayWorkItems();

    return (
        <div className="app">
            <main className="content">

                {/* HEADER */}
                <header className="topbar">
                    <div>
                        <h1>
                            👋 Chào mừng trở lại!
                        </h1>

                        <p>
                            Hôm nay ông muốn làm gì?
                        </p>
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

                  {/* ==========================================
                      V11 PRIORITY WORK CENTER
                  ========================================== */}

                  <PriorityWorkPanel />

               
                {/* =================================
                    VIỆC CẦN LÀM
                ================================= */}
                <section
                    style={{
                        background: "#fff",
                        borderRadius: "15px",
                        padding: "22px",
                        marginTop: "25px",
                        marginBottom: "25px",
                        boxShadow:
                            "0 5px 20px rgba(0,0,0,.08)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                            marginBottom: "18px",
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                }}
                            >
                                📅 Việc cần làm
                            </h2>

                            <p
                                style={{
                                    margin:
                                        "6px 0 0",
                                    color: "#666",
                                }}
                            >
                                Các Facebook Campaign
                                chưa hoàn thành
                            </p>
                        </div>

                        <strong
                            style={{
                                color:
                                    workItems.length > 0
                                        ? "#d71920"
                                        : "#16803c",
                            }}
                        >
                            {workItems.length > 0
                                ? `${workItems.length} việc`
                                : "Không có việc tồn"}
                        </strong>
                    </div>


                    {workItems.length === 0 ? (
                        <div
                            style={{
                                padding: "18px",
                                background: "#f4faf6",
                                borderRadius: "10px",
                                color: "#16803c",
                            }}
                        >
                            ✅ Hôm nay không có
                            Campaign nào đang chờ
                            xử lý.
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection:
                                    "column",
                                gap: "12px",
                            }}
                        >
                            {workItems.map(
                                (campaign) => {
                                    const car =
                                        campaign.carSnapshot ||
                                        {};

                                    const account =
                                        campaign.accountSnapshot ||
                                        {};

                                    const progress =
                                        campaign.progress;

                                    const isCompleted =
                                        progress.total >
                                            0 &&
                                        progress.remaining ===
                                            0;

                                    return (
                                        <div
                                            key={
                                                campaign.id
                                            }
                                            style={{
                                                border:
                                                    "1px solid #eee",
                                                borderRadius:
                                                    "10px",
                                                padding:
                                                    "16px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    gap:
                                                        "15px",
                                                    alignItems:
                                                        "flex-start",
                                                }}
                                            >
                                                <div>
                                                    <h3
                                                        style={{
                                                            margin:
                                                                "0 0 6px",
                                                        }}
                                                    >
                                                        🚗{" "}
                                                        {car.brand ||
                                                            ""}{" "}
                                                        {car.model ||
                                                            ""}
                                                    </h3>

                                                    <div
                                                        style={{
                                                            color:
                                                                "#666",
                                                            fontSize:
                                                                "14px",
                                                        }}
                                                    >
                                                        👤{" "}
                                                        {account.name ||
                                                            "Facebook"}
                                                        {" · "}
                                                        👥{" "}
                                                        {progress.total ||
                                                            campaign.totalJobs ||
                                                            0}{" "}
                                                        nhóm
                                                    </div>
                                                </div>

                                                <strong
                                                    style={{
                                                        color:
                                                            isCompleted
                                                                ? "#16803c"
                                                                : "#d71920",
                                                    }}
                                                >
                                                    {isCompleted
                                                        ? "🟢 Hoàn thành"
                                                        : `🟠 ${progress.completed}/${progress.total}`}
                                                </strong>
                                            </div>


                                            <div
                                                style={{
                                                    marginTop:
                                                        "12px",
                                                    height:
                                                        "8px",
                                                    background:
                                                        "#eee",
                                                    borderRadius:
                                                        "20px",
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width:
                                                            progress.total >
                                                            0
                                                                ? `${Math.min(
                                                                      100,
                                                                      (progress.completed /
                                                                          progress.total) *
                                                                          100
                                                                  )}%`
                                                                : "0%",
                                                        height:
                                                            "100%",
                                                        background:
                                                            "#d71920",
                                                    }}
                                                />
                                            </div>


                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "8px",
                                                    marginTop:
                                                        "12px",
                                                    flexWrap:
                                                        "wrap",
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            "/facebook/queue"
                                                        )
                                                    }
                                                    style={{
                                                        border:
                                                            "none",
                                                        borderRadius:
                                                            "8px",
                                                        padding:
                                                            "9px 14px",
                                                        cursor:
                                                            "pointer",
                                                        background:
                                                            "#d71920",
                                                        color:
                                                            "#fff",
                                                    }}
                                                >
                                                    📋 Vào Queue
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            "/campaign"
                                                        )
                                                    }
                                                    style={{
                                                        border:
                                                            "1px solid #ddd",
                                                        borderRadius:
                                                            "8px",
                                                        padding:
                                                            "9px 14px",
                                                        cursor:
                                                            "pointer",
                                                        background:
                                                            "#fff",
                                                    }}
                                                >
                                                    📣 Xem Campaign
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </section>

                {/* Quick Actions */}
<QuickActions />


                {/* BOTTOM */}
                <section className="dashboard-bottom">
                    <RecentActivity />
                    <AIWidget />
                </section>

            </main>
        </div>
    );
}

export default Dashboard;