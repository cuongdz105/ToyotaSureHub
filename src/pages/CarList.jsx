import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getCars,
    deleteCar,
    markCarAsSold,
    restoreSoldCar,
    getSoldDaysRemaining,
    SOLD_STATUS,
} from "../services/carService";

import {
    deleteCampaignsByCarId,
} from "../services/facebookCampaignService";

import {
    deleteQueueJobsByCarId,
} from "../services/facebookPostingQueueService";

import Button from "../components/UI/Button";

import {
    filterCars,
} from "../utils/carFilter";

import CarRowActions from "../components/CarList/CarRowActions";
import CarTable from "../components/CarList/CarTable";

function CarList() {

    const navigate =
        useNavigate();

    const [cars, setCars] =
        useState(getCars());

    const [search, setSearch] =
        useState("");

    const [activeTab, setActiveTab] =
        useState("active");


    // ==========================================
    // REFRESH
    // ==========================================

    function refreshCars() {
        setCars(
            getCars()
        );
    }


    // ==========================================
    // ACTIVE / SOLD
    // ==========================================

    const activeCars =
        cars.filter(
            (car) =>
                car.status !==
                SOLD_STATUS
        );

    const soldCars =
        cars.filter(
            (car) =>
                car.status ===
                SOLD_STATUS
        );


    const currentCars =
        activeTab === "sold"
            ? soldCars
            : activeCars;


    // ==========================================
    // SEARCH
    // ==========================================

    const filteredCars =
        filterCars(
            currentCars,
            search,
            "Tất cả"
        );


    // ==========================================
    // DELETE NORMAL CAR
    // ==========================================

    function handleDelete(id) {
  const car = cars.find(
    (item) =>
      String(item.id) === String(id)
  );

  if (!car) return;

  const isSold =
    car.status === SOLD_STATUS;

  const carName =
    `${car.brand || ""} ` +
    `${car.model || ""} ` +
    `${car.version || ""}`.trim();

  const ok = window.confirm(
    isSold
      ? `⚠️ XÓA XE ĐÃ BÁN VĨNH VIỄN?\n\n` +
        `${carName}\n\n` +
        `Xe sẽ bị xóa hoàn toàn khỏi mục "Đã bán".\n` +
        `Sau khi xóa, ông sẽ không thể nhập lại xe này từ ToyotaSureHub.\n\n` +
        `Ông có chắc chắn muốn xóa không?`
      : `⚠️ Ông chắc chắn muốn xóa xe này chứ?\n\n` +
        `${carName}`
  );

  if (!ok) return;

  deleteCar(id);

  refreshCars();
}


    // ==========================================
    // MARK CAR AS SOLD
    // ==========================================

    function handleMarkAsSold(
        car
    ) {

        const campaignsCount =
            (() => {
                try {
                    const raw =
                        localStorage.getItem(
                            "toyota_sure_hub_facebook_campaigns"
                        );

                    if (!raw) {
                        return 0;
                    }

                    const campaigns =
                        JSON.parse(raw);

                    if (
                        !Array.isArray(
                            campaigns
                        )
                    ) {
                        return 0;
                    }

                    return campaigns.filter(
                        (campaign) =>
                            String(
                                campaign.carId
                            ) ===
                            String(
                                car.id
                            )
                    ).length;

                } catch {
                    return 0;
                }
            })();


        const queueCount =
            (() => {
                try {
                    const raw =
                        localStorage.getItem(
                            "facebook_posting_queue"
                        );

                    if (!raw) {
                        return 0;
                    }

                    const queue =
                        JSON.parse(raw);

                    if (
                        !Array.isArray(
                            queue
                        )
                    ) {
                        return 0;
                    }

                    return queue.filter(
                        (job) =>
                            String(
                                job.carId
                            ) ===
                            String(
                                car.id
                            )
                    ).length;

                } catch {
                    return 0;
                }
            })();


        const message =
            campaignsCount > 0 ||
            queueCount > 0

                ? (
                    `⚠️ XÁC NHẬN XE ĐÃ BÁN\n\n` +

                    `${car.brand || ""} ` +
                    `${car.model || ""} ` +
                    `${car.version || ""}\n\n` +

                    `Xe này hiện đang có:\n` +
                    `• ${campaignsCount} Campaign\n` +
                    `• ${queueCount} Queue Job\n\n` +

                    `Nếu xác nhận, toàn bộ ` +
                    `Campaign và Queue Job của xe ` +
                    `sẽ bị xóa.\n\n` +

                    `Xe sẽ được lưu trong mục ` +
                    `"Đã bán" tối đa 30 ngày.`
                )

                : (
                    `⚠️ Xác nhận xe này đã bán?\n\n` +

                    `${car.brand || ""} ` +
                    `${car.model || ""} ` +
                    `${car.version || ""}\n\n` +

                    `Xe sẽ chuyển sang mục ` +
                    `"Đã bán" và được lưu tối đa 30 ngày.`
                );


        const ok =
            window.confirm(
                message
            );

        if (!ok) {
            return;
        }


        // --------------------------------------
        // 1. XÓA CAMPAIGN
        // --------------------------------------

        const deletedCampaigns =
            deleteCampaignsByCarId(
                car.id
            );


        // --------------------------------------
        // 2. XÓA QUEUE
        // --------------------------------------

        const deletedQueueJobs =
            deleteQueueJobsByCarId(
                car.id
            );


        // --------------------------------------
        // 3. CHUYỂN XE SANG ĐÃ BÁN
        // --------------------------------------

        markCarAsSold(
            car.id
        );


        refreshCars();


        console.log(
            "🚗 Xe đã bán:",
            car.id
        );

        console.log(
            "🗑️ Campaign đã xóa:",
            deletedCampaigns
        );

        console.log(
            "🗑️ Queue Job đã xóa:",
            deletedQueueJobs
        );


        alert(
            `✅ Đã chuyển xe sang "Đã bán".\n\n` +
            `🗑️ Campaign: ${deletedCampaigns}\n` +
            `🗑️ Queue Job: ${deletedQueueJobs}\n\n` +
            `Xe sẽ được lưu tạm 30 ngày.`
        );
    }


    // ==========================================
    // RESTORE SOLD CAR
    // ==========================================

    function handleRestore(
        car
    ) {

        const ok =
            window.confirm(
                `↩️ NHẬP LẠI XE?\n\n` +

                `${car.brand || ""} ` +
                `${car.model || ""} ` +
                `${car.version || ""}\n\n` +

                `Xe sẽ được đưa trở lại danh sách ` +
                `"Đang bán" dưới dạng một xe nhập mới.\n\n` +

                `Campaign và Queue cũ sẽ không được khôi phục.`
            );

        if (!ok) {
            return;
        }


        const newCar =
            restoreSoldCar(
                car.id
            );


        refreshCars();


        // Chuyển về tab đang bán
        setActiveTab(
            "active"
        );


        alert(
            `✅ Đã nhập lại xe.\n\n` +
            `ID cũ: ${car.id}\n` +
            `ID mới: ${newCar.id}\n\n` +
            `Xe được coi là một xe nhập mới.`
        );
    }


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="app">

            <main className="content">

                {/* HEADER */}
                <div className="topbar">

                    <h1>
                        Quản lý xe
                    </h1>

                    <Button
                        onClick={() =>
                            navigate(
                                "/cars/new"
                            )
                        }
                    >
                        ➕ Thêm xe
                    </Button>

                </div>


                {/* TABS */}
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "20px",
                    }}
                >

                    <button
                        onClick={() =>
                            setActiveTab(
                                "active"
                            )
                        }
                        style={{
                            padding:
                                "12px 20px",
                            border:
                                "none",
                            borderRadius:
                                "8px",
                            cursor:
                                "pointer",
                            fontWeight:
                                "bold",
                            background:
                                activeTab ===
                                "active"
                                    ? "#d71920"
                                    : "#eee",
                            color:
                                activeTab ===
                                "active"
                                    ? "#fff"
                                    : "#333",
                        }}
                    >
                        🟢 Đang bán (
                        {activeCars.length}
                        )
                    </button>


                    <button
                        onClick={() =>
                            setActiveTab(
                                "sold"
                            )
                        }
                        style={{
                            padding:
                                "12px 20px",
                            border:
                                "none",
                            borderRadius:
                                "8px",
                            cursor:
                                "pointer",
                            fontWeight:
                                "bold",
                            background:
                                activeTab ===
                                "sold"
                                    ? "#555"
                                    : "#eee",
                            color:
                                activeTab ===
                                "sold"
                                    ? "#fff"
                                    : "#333",
                        }}
                    >
                        🔴 Đã bán (
                        {soldCars.length}
                        )
                    </button>

                </div>


                {/* SEARCH */}
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm xe..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    className="search-box"
                />


                {/* ACTIVE TAB */}
                {activeTab ===
                    "active" && (

                    <CarTable
                        cars={
                            filteredCars
                        }
                        navigate={
                            navigate
                        }
                        onDelete={
                            handleDelete
                        }
                        onMarkAsSold={
                            handleMarkAsSold
                        }
                    />

                )}


                {/* SOLD TAB */}
                {activeTab ===
                    "sold" && (

                    <div>

                        {filteredCars.length ===
                            0 ? (

                            <div
                                style={{
                                    background:
                                        "#fff",
                                    padding:
                                        "40px",
                                    borderRadius:
                                        "15px",
                                    textAlign:
                                        "center",
                                }}
                            >
                                🚗 Chưa có xe đã bán.
                            </div>

                        ) : (

                            <div
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill, minmax(280px, 1fr))",
                                    gap:
                                        "20px",
                                }}
                            >

                                {filteredCars.map(
                                    (
                                        car
                                    ) => {

                                        const days =
                                            getSoldDaysRemaining(
                                                car
                                            );

                                        return (

                                            <div
                                                key={
                                                    car.id
                                                }
                                                style={{
                                                    background:
                                                        "#fff",
                                                    borderRadius:
                                                        "15px",
                                                    padding:
                                                        "20px",
                                                    boxShadow:
                                                        "0 5px 20px rgba(0,0,0,.08)",
                                                }}
                                            >

                                                <h3>
                                                    🚗{" "}
                                                    {
                                                        car.brand
                                                    }{" "}
                                                    {
                                                        car.model
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        car.version
                                                    }
                                                </p>

                                                <p>
                                                    {car.color ||
                                                        "Chưa rõ"}
                                                    {" · "}
                                                    {car.odo ||
                                                        "Chưa rõ"}
                                                </p>

                                                <p
                                                    style={{
                                                        marginTop:
                                                            "10px",
                                                        color:
                                                            "#d71920",
                                                        fontWeight:
                                                            "bold",
                                                    }}
                                                >
                                                    🔴 Đã bán
                                                </p>

                                                <p>
                                                    📅 Bán:
                                                    {" "}
                                                    {car.soldAt
                                                        ? new Date(
                                                            car.soldAt
                                                        ).toLocaleDateString(
                                                            "vi-VN"
                                                        )
                                                        : "Không rõ"}
                                                </p>

                                                <p>
                                                    ⏳ Còn lưu:
                                                    {" "}
                                                    <strong>
                                                        {days ===
                                                        null
                                                            ? "Không xác định"
                                                            : `${days} ngày`}
                                                    </strong>
                                                </p>


                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap:
                                                            "10px",
                                                        marginTop:
                                                            "15px",
                                                    }}
                                                >

                                                   <Button
                                                        onClick={() =>
                                                        navigate(`/cars/${car.id}`)
                                                      }
                                                    >
                                                      👁️ Xem
                                                    </Button>

                                                    <Button
                                                      onClick={() =>
                                                        handleRestore(car)
                                                      }
                                                    >
                                                      ↩️ Nhập lại
                                                    </Button>

                                                    <Button
                                                        variant="danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                car.id
                                                            )
                                                        }
                                                    >
                                                        🗑️ Xóa
                                                    </Button>

                                                </div>

                                            </div>

                                        );
                                    }
                                )}

                            </div>

                        )}

                    </div>

                )}

            </main>

        </div>
    );
}

export default CarList;