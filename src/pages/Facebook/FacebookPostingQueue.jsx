import { useEffect, useState } from "react";

import SectionCard from "../../components/Common/SectionCard";
import PrimaryButton from "../../components/Common/PrimaryButton";

import {
    loadPostingQueue,
    removeQueueJob,
    clearPostingQueue,
    getQueueStats,
} from "../../services/facebookPostingQueueService";

import {
    processFacebookJob,
    processFacebookQueue,
} from "../../services/facebookPostingWorkerService";


const CAR_STORAGE_KEY =
    "toyota_sure_hub_cars";


function loadCars() {
    try {
        const data =
            localStorage.getItem(
                CAR_STORAGE_KEY
            );

        if (!data) {
            return [];
        }

        const cars = JSON.parse(data);

        return Array.isArray(cars)
            ? cars
            : [];

    } catch (error) {

        console.error(
            "Không đọc được danh sách xe:",
            error
        );

        return [];
    }
}


function FacebookPostingQueue() {

    const [queue, setQueue] =
        useState([]);

    const [stats, setStats] =
        useState({
            total: 0,
            waiting: 0,
            processing: 0,
            success: 0,
            failed: 0,
        });

    const [cars, setCars] =
        useState([]);

    const [processing, setProcessing] =
        useState(false);


    // ==========================================
    // REFRESH
    // ==========================================

    function refresh() {

        setQueue(
            loadPostingQueue()
        );

        setStats(
            getQueueStats()
        );

        setCars(
            loadCars()
        );
    }


    useEffect(() => {
        refresh();
    }, []);


    // ==========================================
    // TÌM XE
    // ==========================================

    function getCar(job) {

        return (
            cars.find(
                (car) =>
                    String(car.id) ===
                    String(job.carId)
            ) || null
        );
    }


    // ==========================================
    // STATUS LABEL
    // ==========================================

    function getStatusLabel(
        status
    ) {

        switch (status) {

            case "waiting":
                return "🟡 Chờ đăng";

            case "processing":
                return "🔵 Đang xử lý";

            case "success":
                return "🟢 Thành công";

            case "failed":
                return "🔴 Thất bại";

            default:
                return status || "Không rõ";
        }
    }


    // ==========================================
    // STATUS BACKGROUND
    // ==========================================

    function getStatusBackground(
        status
    ) {

        switch (status) {

            case "waiting":
                return "#fff8e1";

            case "processing":
                return "#e3f2fd";

            case "success":
                return "#e8f5e9";

            case "failed":
                return "#ffebee";

            default:
                return "#f5f5f5";
        }
    }


    // ==========================================
    // REMOVE
    // ==========================================

    function handleRemove(id) {

        const confirmed =
            window.confirm(
                "Xóa bài đăng này khỏi Queue?"
            );

        if (!confirmed) {
            return;
        }

        removeQueueJob(id);

        refresh();
    }


    // ==========================================
    // CLEAR QUEUE
    // ==========================================

    function handleClear() {

        if (
            queue.length === 0
        ) {

            alert(
                "📭 Queue đang trống."
            );

            return;
        }


        const confirmed =
            window.confirm(
                "⚠️ Xóa TOÀN BỘ Queue?\n\nHành động này không thể hoàn tác."
            );


        if (!confirmed) {
            return;
        }


        clearPostingQueue();

        refresh();


        alert(
            "🗑️ Đã xóa toàn bộ Queue."
        );
    }


    // ==========================================
    // PROCESS ONE JOB
    // ==========================================

    async function handleProcessJob(
        jobId
    ) {

        if (processing) {
            return;
        }


        try {

            setProcessing(
                true
            );


            await processFacebookJob(
                jobId
            );


            refresh();


            alert(
                "🟢 Job đã xử lý thành công!\n\n" +
                "⚠️ Đây vẫn là Posting Engine mô phỏng, chưa đăng Facebook thật."
            );

        } catch (error) {

            console.error(
                "Facebook Worker Error:",
                error
            );


            refresh();


            alert(
                "🔴 Xử lý thất bại:\n\n" +
                (
                    error?.message ||
                    "Lỗi không xác định."
                )
            );

        } finally {

            setProcessing(
                false
            );

            refresh();
        }
    }


    // ==========================================
    // PROCESS ALL
    // ==========================================

    async function handleProcessAll() {

        if (
            processing
        ) {
            return;
        }


        if (
            stats.waiting === 0
        ) {

            alert(
                "📭 Không có bài nào đang chờ xử lý."
            );

            return;
        }


        try {

            setProcessing(
                true
            );


            const results =
                await processFacebookQueue();


            refresh();


            const successCount =
                results.filter(
                    (item) =>
                        item?.status ===
                        "success"
                ).length;


            const failedCount =
                results.filter(
                    (item) =>
                        item?.status ===
                        "failed"
                ).length;


            alert(
                "🚀 Queue đã xử lý xong!\n\n" +
                `🟢 Thành công: ${successCount}\n` +
                `🔴 Thất bại: ${failedCount}\n\n` +
                "⚠️ Đây vẫn là Posting Engine mô phỏng."
            );

        } catch (error) {

            console.error(
                "Queue Worker Error:",
                error
            );


            alert(
                "❌ Queue Worker lỗi:\n\n" +
                (
                    error?.message ||
                    "Lỗi không xác định."
                )
            );

        } finally {

            setProcessing(
                false
            );

            refresh();
        }
    }


    // ==========================================
    // RETRY FAILED JOB
    // ==========================================

    async function handleRetry(
        job
    ) {

        /*
         * Worker chỉ nhận Job
         * đang ở trạng thái waiting.
         *
         * Vì vậy phải chuyển failed
         * về waiting trước.
         */

        try {

            const {
                updateQueueJob,
            } = await import(
                "../../services/facebookPostingQueueService"
            );


            updateQueueJob(
                job.id,
                {
                    status:
                        "waiting",

                    error:
                        null,

                    result:
                        null,
                }
            );


            refresh();


            /*
             * Cho Worker xử lý ngay
             */

            await handleProcessJob(
                job.id
            );

        } catch (error) {

            console.error(
                "Retry Error:",
                error
            );


            refresh();


            alert(
                "❌ Không thể chạy lại bài:\n\n" +
                (
                    error?.message ||
                    "Lỗi không xác định."
                )
            );
        }
    }


    // ==========================================
    // FORMAT TIME
    // ==========================================

    function formatTime(
        value
    ) {

        if (!value) {
            return "-";
        }


        try {

            return new Date(
                value
            ).toLocaleString(
                "vi-VN"
            );

        } catch {
            return value;
        }
    }


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <main className="content">

            <h1>
                📋 Facebook Posting Queue
            </h1>


            <p
                style={{
                    color: "#666",
                }}
            >
                Quản lý toàn bộ bài đăng
                Facebook đang chờ xử lý.
            </p>


            {/* =================================
                OVERVIEW
            ================================= */}

            <SectionCard
                title="📊 Tổng quan"
            >

                <div
                    style={{
                        display:
                            "grid",

                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",

                        gap:
                            "12px",
                    }}
                >

                    <div>
                        📦 Tổng:
                        {" "}
                        <strong>
                            {stats.total}
                        </strong>
                    </div>


                    <div>
                        🟡 Chờ:
                        {" "}
                        <strong>
                            {stats.waiting}
                        </strong>
                    </div>


                    <div>
                        🔵 Đang xử lý:
                        {" "}
                        <strong>
                            {stats.processing}
                        </strong>
                    </div>


                    <div>
                        🟢 Thành công:
                        {" "}
                        <strong>
                            {stats.success}
                        </strong>
                    </div>


                    <div>
                        🔴 Thất bại:
                        {" "}
                        <strong>
                            {stats.failed}
                        </strong>
                    </div>

                </div>

            </SectionCard>


            {/* =================================
                QUEUE CONTROL
            ================================= */}

            <SectionCard
                title="🚀 Điều khiển Queue"
            >

                <div
                    style={{
                        display:
                            "flex",

                        gap:
                            "10px",

                        flexWrap:
                            "wrap",
                    }}
                >

                    <PrimaryButton
                        onClick={
                            handleProcessAll
                        }
                        disabled={
                            processing ||
                            stats.waiting === 0
                        }
                    >
                        {processing
                            ? "⏳ Worker đang chạy..."
                            : "🚀 CHẠY QUEUE WORKER"}
                    </PrimaryButton>


                    <PrimaryButton
                        onClick={
                            refresh
                        }
                        disabled={
                            processing
                        }
                    >
                        🔄 Làm mới
                    </PrimaryButton>


                    <PrimaryButton
                        onClick={
                            handleClear
                        }
                        disabled={
                            processing ||
                            queue.length === 0
                        }
                    >
                        🗑️ Xóa toàn bộ Queue
                    </PrimaryButton>

                </div>


                <div
                    style={{
                        marginTop:
                            "15px",

                        background:
                            "#fff8e1",

                        padding:
                            "12px",

                        borderRadius:
                            "8px",

                        border:
                            "1px solid #ffe082",
                    }}
                >

                    ⚠️{" "}
                    <strong>
                        Chế độ mô phỏng:
                    </strong>{" "}
                    Queue Worker hiện chỉ
                    mô phỏng quá trình đăng
                    Facebook, chưa đăng bài
                    thật lên Facebook.

                </div>

            </SectionCard>


            {/* =================================
                QUEUE LIST
            ================================= */}

            <SectionCard
                title="📋 Danh sách bài đăng"
            >

                {queue.length === 0 ? (

                    <div
                        style={{
                            padding:
                                "30px",

                            textAlign:
                                "center",

                            color:
                                "#777",
                        }}
                    >

                        📭 Chưa có bài đăng
                        nào trong Queue.

                    </div>

                ) : (

                    queue.map(
                        (
                            job,
                            index
                        ) => {

                            const car =
                                getCar(
                                    job
                                );


                            return (

                                <div
                                    key={
                                        job.id
                                    }
                                    style={{
                                        border:
                                            "1px solid #ddd",

                                        borderRadius:
                                            "12px",

                                        padding:
                                            "18px",

                                        marginBottom:
                                            "15px",

                                        background:
                                            "#fff",

                                        boxShadow:
                                            "0 2px 6px rgba(0,0,0,0.05)",
                                    }}
                                >

                                    {/* HEADER */}

                                    <div
                                        style={{
                                            display:
                                                "flex",

                                            justifyContent:
                                                "space-between",

                                            alignItems:
                                                "flex-start",

                                            gap:
                                                "12px",

                                            flexWrap:
                                                "wrap",
                                        }}
                                    >

                                        <div>

                                            <h3
                                                style={{
                                                    marginTop:
                                                        0,
                                                    marginBottom:
                                                        "6px",
                                                }}
                                            >

                                                #{index + 1}{" "}

                                                {car
                                                    ? `${car.brand || ""} ${car.model || ""}`
                                                    : `Car ID: ${job.carId || "-"}`}

                                            </h3>


                                            {car && (
                                                <div
                                                    style={{
                                                        color:
                                                            "#666",
                                                    }}
                                                >
                                                    {car.version || ""}
                                                    {" · "}
                                                    {car.year || ""}
                                                </div>
                                            )}

                                        </div>


                                        <div
                                            style={{
                                                background:
                                                    getStatusBackground(
                                                        job.status
                                                    ),

                                                padding:
                                                    "7px 12px",

                                                borderRadius:
                                                    "20px",

                                                fontWeight:
                                                    "600",

                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {
                                                getStatusLabel(
                                                    job.status
                                                )
                                            }
                                        </div>

                                    </div>


                                    <hr />


                                    {/* ACCOUNT */}

                                    <p>

                                        👤{" "}
                                        <strong>
                                            Tài khoản:
                                        </strong>{" "}

                                        {
                                            job.account?.name ||
                                            `ID ${job.accountId || "-"}`
                                        }

                                    </p>


                                    {/* GROUP */}

                                    <p>

                                        👥{" "}
                                        <strong>
                                            Nhóm:
                                        </strong>{" "}

                                        {
                                            job.group?.name ||
                                            "Không rõ"
                                        }

                                    </p>


                                    {/* IMAGE */}

                                    <p>

                                        📷{" "}
                                        <strong>
                                            Ảnh:
                                        </strong>{" "}

                                        {
                                            job.imageCount ||
                                            0
                                        }

                                    </p>


                                    {/* CREATED */}

                                    <p>

                                        🕐{" "}
                                        <strong>
                                            Tạo lúc:
                                        </strong>{" "}

                                        {
                                            formatTime(
                                                job.createdAt
                                            )
                                        }

                                    </p>


                                    {/* CONTENT */}

                                    <p>

                                        📝{" "}
                                        <strong>
                                            Nội dung:
                                        </strong>{" "}

                                        {job.content?.trim()
                                            ? "Đã có"
                                            : "Trống"}

                                    </p>


                                    {/* ERROR */}

                                    {job.error && (

                                        <div
                                            style={{
                                                background:
                                                    "#ffebee",

                                                border:
                                                    "1px solid #ffcdd2",

                                                color:
                                                    "#c62828",

                                                padding:
                                                    "10px",

                                                borderRadius:
                                                    "8px",

                                                marginTop:
                                                    "10px",
                                            }}
                                        >

                                            ❌{" "}
                                            <strong>
                                                Lỗi:
                                            </strong>{" "}

                                            {
                                                job.error
                                            }

                                        </div>

                                    )}


                                    {/* LOGS */}

                                    {Array.isArray(
                                        job.logs
                                    ) &&
                                        job.logs.length >
                                            0 && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "15px",

                                                padding:
                                                    "12px",

                                                background:
                                                    "#f7f7f7",

                                                borderRadius:
                                                    "8px",

                                                border:
                                                    "1px solid #e0e0e0",
                                            }}
                                        >

                                            <strong>
                                                📜 Nhật ký xử lý
                                            </strong>


                                            <div
                                                style={{
                                                    marginTop:
                                                        "10px",
                                                }}
                                            >

                                                {job.logs.map(
                                                    (
                                                        log,
                                                        logIndex
                                                    ) => (

                                                        <div
                                                            key={
                                                                logIndex
                                                            }
                                                            style={{
                                                                padding:
                                                                    "7px 0",

                                                                borderBottom:
                                                                    logIndex <
                                                                    job.logs.length -
                                                                        1
                                                                        ? "1px solid #eee"
                                                                        : "none",

                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >

                                                            <span>
                                                                {
                                                                    log.message
                                                                }
                                                            </span>


                                                            <span
                                                                style={{
                                                                    marginLeft:
                                                                        "10px",

                                                                    color:
                                                                        "#888",

                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            >

                                                                {
                                                                    log.timestamp
                                                                        ? new Date(
                                                                              log.timestamp
                                                                          ).toLocaleTimeString(
                                                                              "vi-VN"
                                                                          )
                                                                        : ""
                                                                }

                                                            </span>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )}


                                    {/* ACTIONS */}

                                    <div
                                        style={{
                                            display:
                                                "flex",

                                            gap:
                                                "10px",

                                            flexWrap:
                                                "wrap",

                                            marginTop:
                                                "16px",
                                        }}
                                    >

                                        {job.status ===
                                            "waiting" && (

                                            <PrimaryButton
                                                onClick={() =>
                                                    handleProcessJob(
                                                        job.id
                                                    )
                                                }
                                                disabled={
                                                    processing
                                                }
                                            >
                                                🚀 Xử lý bài này
                                            </PrimaryButton>

                                        )}


                                        {job.status ===
                                            "failed" && (

                                            <PrimaryButton
                                                onClick={() =>
                                                    handleRetry(
                                                        job
                                                    )
                                                }
                                                disabled={
                                                    processing
                                                }
                                            >
                                                🔁 Chạy lại
                                            </PrimaryButton>

                                        )}


                                        <PrimaryButton
                                            onClick={() =>
                                                handleRemove(
                                                    job.id
                                                )
                                            }
                                            disabled={
                                                processing
                                            }
                                        >
                                            🗑️ Xóa
                                        </PrimaryButton>

                                    </div>

                                </div>

                            );
                        }
                    )

                )}

            </SectionCard>

        </main>
    );
}


export default FacebookPostingQueue;