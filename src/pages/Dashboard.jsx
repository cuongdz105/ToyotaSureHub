import { useEffect, useState } from "react";

import DashboardCard from "../components/DashboardCard";
import QuickActions from "../components/QuickActions";
import RecentActivity from "../components/RecentActivity";
import AIWidget from "../components/AIWidget";
import PriorityWorkPanel from "../components/PriorityWorkPanel";

import { getDashboardData } from "../services/dashboardService";


function Dashboard() {

    const [dashboardData, setDashboardData] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        let mounted = true;


        async function loadDashboard() {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getDashboardData();

                if (!mounted) {
                    return;
                }

                setDashboardData(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "Dashboard load error:",
                    error
                );

                if (!mounted) {
                    return;
                }

                setDashboardData([]);

                setError(
                    error?.message ||
                    "Không thể tải dữ liệu Dashboard."
                );

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }

        }


        loadDashboard();


        return () => {
            mounted = false;
        };

    }, []);


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

                    {loading ? (

                        <div
                            style={{
                                gridColumn:
                                    "1 / -1",
                                padding: 20,
                                color: "#666",
                            }}
                        >
                            ⏳ Đang tải dữ liệu xe...
                        </div>

                    ) : error ? (

                        <div
                            style={{
                                gridColumn:
                                    "1 / -1",
                                padding: 20,
                                border:
                                    "1px solid #f1b5b5",
                                borderRadius: 10,
                                background:
                                    "#fff5f5",
                                color: "#b42318",
                            }}
                        >
                            ❌ {error}
                        </div>

                    ) : (

                        dashboardData.map(
                            (item, index) => (

                                <DashboardCard
                                    key={index}
                                    icon={item.icon}
                                    title={item.title}
                                    value={item.value}
                                />

                            )
                        )

                    )}

                </section>


                {/* ==========================================
                    V11 PRIORITY WORK CENTER
                ========================================== */}

                <PriorityWorkPanel />


                {/* QUICK ACTIONS */}

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