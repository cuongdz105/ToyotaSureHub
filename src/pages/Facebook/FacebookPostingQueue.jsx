import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionCard from "../../components/Common/SectionCard";
import PrimaryButton from "../../components/Common/PrimaryButton";

import {
    loadPostingQueue,
    updateQueueJob,
    removeQueueJob,
    clearPostingQueue,
    getQueueStats,
} from "../../services/facebookPostingQueueService";

import {
    processFacebookJob,
    processFacebookQueue,
    getMaxRetries,
} from "../../services/facebookPostingWorkerService";

import {
    getQueueFixAction,
} from "../../services/facebookQueueErrorService";

import {
    createFacebookQueueTestJob,
    getFacebookQueueTestTypes,
    removeAllFacebookQueueTestJobs,
} from "../../services/facebookQueueTestService";


function FacebookPostingQueue() {

    const navigate = useNavigate();

    const [queue, setQueue] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        waiting: 0,
        processing: 0,
        success: 0,
        failed: 0,
    });

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
    }


    useEffect(() => {
        refresh();
    }, []);


    // ==========================================
    // REMOVE
    // ==========================================

    function handleRemove(jobId) {

        removeQueueJob(
            jobId
        );

        refresh();
    }


    // ==========================================
    // CLEAR
    // ==========================================

    function handleClear() {

        if (
            !window.confirm(
                "Xóa toàn bộ hàng đợi đăng Facebook?"
            )
        ) {
            return;
        }

        clearPostingQueue();

        refresh();
    }


    // ==========================================
    // PROCESS ONE
    // ==========================================

    async function handleProcessJob(
        jobId
    ) {

        if (processing) {
            return;
        }

        try {

            setProcessing(true);

            await processFacebookJob(
                jobId
            );

            refresh();

        } catch (error) {

            console.error(
                "Process Job Error:",
                error
            );

            refresh();

        } finally {

            setProcessing(false);

            refresh();
        }
    }


    // ==========================================
    // PROCESS ALL
    // ==========================================

    async function handleProcessAll() {

        if (
            processing ||
            queue.length === 0
        ) {
            return;
        }

        try {

            setProcessing(true);

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

            const waitingCount =
                loadPostingQueue().filter(
                    (item) =>
                        item.status ===
                        "waiting"
                ).length;

            alert(
                "🚀 Queue đã xử lý xong!\n\n" +
                `🟢 Thành công: ${successCount}\n` +
                `🔴 Thất bại: ${failedCount}\n` +
                `🟡 Còn chờ: ${waitingCount}`
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

            setProcessing(false);

            refresh();
        }
    }


    // ==========================================
    // RETRY
    // ==========================================

    async function handleRetry(
        job
    ) {

        if (processing) {
            return;
        }


        const retryCount =
            Number(
                job.retryCount || 0
            );


        const maxRetries =
            getMaxRetries();


        if (
            retryCount >=
            maxRetries
        ) {

            alert(
                `⛔ Job đã đạt giới hạn ${maxRetries} lần Retry.\n\n` +
                "Ông hãy sửa nguyên nhân trước."
            );

            return;
        }


        try {

            setProcessing(true);


            /**
             * FAILED → WAITING
             *
             * Worker chỉ nhận Job WAITING.
             */

            updateQueueJob(
                job.id,
                {
                    status:
                        "waiting",

                    error:
                        null,
                }
            );


            refresh();


            /**
             * Sau đó chạy lại Job.
             */

            await processFacebookJob(
                job.id
            );


            refresh();

        } catch (error) {

            console.error(
                "Retry Error:",
                error
            );

            refresh();

        } finally {

            setProcessing(false);

            refresh();
        }
    }


    // ==========================================
    // SMART FIX
    // ==========================================

    function handleFixError(
        job
    ) {

        const action =
            getQueueFixAction(
                job
            );


        /**
         * Lỗi có thể Retry
         *
         * Không cần mở màn hình sửa.
         */

        if (
            action.canRetry &&
            !action.route
        ) {

            handleRetry(
                job
            );

            return;
        }


        /**
         * Không có route sửa
         */

        if (
            !action.route
        ) {

            alert(
                action.description ||
                "Chưa xác định được cách sửa lỗi."
            );

            return;
        }


        /**
         * =================================
         * ACCOUNT / GROUP PERMISSION
         * =================================
         *
         * Truyền:
         *
         * accountId
         * groupId
         * jobId
         * returnTo
         */

        if (
            action.type ===
            "permission"
        ) {

            const params =
                new URLSearchParams();


            if (
                action.params?.accountId
            ) {

                params.set(
                    "accountId",
                    String(
                        action.params.accountId
                    )
                );
            }


            if (
                action.params?.groupId
            ) {

                params.set(
                    "groupId",
                    String(
                        action.params.groupId
                    )
                );
            }


            params.set(
                "jobId",
                String(
                    job.id
                )
            );


            params.set(
                "returnTo",
                "queue"
            );


            navigate(
                `${action.route}?${params.toString()}`
            );

            return;
        }


        /**
         * =================================
         * ACCOUNT
         * =================================
         */

        if (
            action.type ===
            "account"
        ) {

            const params =
                new URLSearchParams();


            if (
                action.params?.accountId
            ) {

                params.set(
                    "accountId",
                    String(
                        action.params.accountId
                    )
                );
            }


            params.set(
                "jobId",
                String(
                    job.id
                )
            );


            params.set(
                "returnTo",
                "queue"
            );


            navigate(
                `${action.route}?${params.toString()}`
            );

            return;
        }


        /**
         * =================================
         * IMAGE
         * =================================
         */

        if (
            action.type ===
            "image"
        ) {

            navigate(
                `${action.route}?returnTo=queue&jobId=${encodeURIComponent(
                    job.id
                )}`
            );

            return;
        }


        /**
         * =================================
         * CONTENT
         * =================================
         */

        if (
            action.type ===
            "content"
        ) {

            const params =
                new URLSearchParams();


            if (
                job.carId
            ) {

                params.set(
                    "carId",
                    String(
                        job.carId
                    )
                );
            }


            if (
                job.group?.id
            ) {

                params.set(
                    "groupId",
                    String(
                        job.group.id
                    )
                );
            }


            params.set(
                "jobId",
                String(
                    job.id
                )
            );


            params.set(
                "returnTo",
                "queue"
            );


            navigate(
                `${action.route}?${params.toString()}`
            );

            return;
        }


        /**
         * =================================
         * GROUP
         * =================================
         */

        if (
            action.type ===
            "group"
        ) {

            const params =
                new URLSearchParams();


            if (
                job.group?.id
            ) {

                params.set(
                    "groupId",
                    String(
                        job.group.id
                    )
                );
            }


            params.set(
                "jobId",
                String(
                    job.id
                )
            );


            params.set(
                "returnTo",
                "queue"
            );


            navigate(
                `${action.route}?${params.toString()}`
            );

            return;
        }


        /**
         * UNKNOWN
         */

        alert(
            action.description ||
            "Chưa xác định được cách sửa lỗi."
        );
    }


    // ==========================================
    // NEXT JOB
    // ==========================================

    function handleNextJob() {

        const nextJob =
            queue.find(
                (job) =>
                    job.status ===
                    "waiting"
            );


        if (!nextJob) {

            alert(
                "📭 Không còn Job nào đang chờ."
            );

            return;
        }


        const element =
            document.getElementById(
                `queue-job-${nextJob.id}`
            );


        if (element) {

            element.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center",
            });
        }
    }


    // ==========================================
    // STATUS
    // ==========================================

    function getStatusLabel(
        status
    ) {

        switch (status) {

            case "waiting":
                return "🟡 Chờ xử lý";

            case "processing":
                return "🔵 Đang xử lý";

            case "success":
                return "🟢 Thành công";

            case "failed":
                return "🔴 Thất bại";

            default:
                return status;
        }
    }


    // ==========================================
    // COUNTERS
    // ==========================================

    const waitingJobs =
        queue.filter(
            (job) =>
                job.status ===
                "waiting"
        );

    const failedJobs =
        queue.filter(
            (job) =>
                job.status ===
                "failed"
        );


    const maxRetries =
        getMaxRetries();

        // ==========================================
// DEV TEST ERROR HANDLING
// ==========================================

function handleCreateTestJob(errorType) {

    try {

        const job =
            createFacebookQueueTestJob(
                errorType
            );

        refresh();

        alert(
            "🧪 Đã tạo Job lỗi test!\n\n" +
            `❌ Lỗi: ${job.error}\n\n` +
            "Hãy kéo xuống Job vừa tạo và bấm 🔧 Sửa lỗi."
        );

    } catch (error) {

        console.error(
            "Create Test Job Error:",
            error
        );

        alert(
            "❌ Không tạo được Job test:\n\n" +
            (
                error?.message ||
                "Lỗi không xác định."
            )
        );
    }
}


// ==========================================
// REMOVE ALL TEST JOBS
// ==========================================

function handleClearTestJobs() {

    const testCount =
        queue.filter(
            (job) =>
                job &&
                job.testMode === true
        ).length;

    if (testCount === 0) {

        alert(
            "🧪 Không có Job Test nào trong Queue."
        );

        return;
    }

    const confirmed =
        window.confirm(
            `🧹 Xóa ${testCount} Job TEST?\n\n` +
            "Chỉ các Job có testMode = true sẽ bị xóa.\n" +
            "Job thật sẽ được giữ nguyên."
        );

    if (!confirmed) {
        return;
    }

    const removed =
        removeAllFacebookQueueTestJobs();

    refresh();

    alert(
        `🧹 Đã xóa ${removed} Job TEST.\n\n` +
        "Các Job thật không bị ảnh hưởng."
    );
}


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <main className="content">

            {/* =================================
                HEADER
            ================================= */}

            <div
                style={{
                    display:
                        "flex",

                    justifyContent:
                        "space-between",

                    alignItems:
                        "center",

                    gap:
                        "12px",

                    flexWrap:
                        "wrap",

                    marginBottom:
                        "15px",
                }}
            >

                <div>

                    <h1
                        style={{
                            marginBottom:
                                "5px",
                        }}
                    >
                        📋 Facebook Posting Queue
                    </h1>

                    <p
                        style={{
                            margin:
                                0,

                            color:
                                "#666",
                        }}
                    >
                        Quản lý và xử lý hàng loạt
                        bài đăng Facebook.
                    </p>

                </div>


                <div
                    style={{
                        display:
                            "flex",

                        gap:
                            "8px",

                        flexWrap:
                            "wrap",
                    }}
                >

                    <PrimaryButton
                        onClick={
                            handleNextJob
                        }
                        disabled={
                            waitingJobs.length ===
                            0
                        }
                    >
                        ▶️ Bài tiếp theo
                    </PrimaryButton>


                    <PrimaryButton
                        onClick={
                            handleProcessAll
                        }
                        disabled={
                            processing ||
                            waitingJobs.length ===
                            0
                        }
                    >
                        {processing
                            ? "⏳ Worker đang chạy..."
                            : `🚀 Chạy ${waitingJobs.length} bài`}
                    </PrimaryButton>

                </div>

            </div>


            {/* =================================
                STATS
            ================================= */}

            <SectionCard
                title="📊 Tổng quan Queue"
            >

                <div
                    style={{
                        display:
                            "grid",

                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(140px, 1fr))",

                        gap:
                            "12px",
                    }}
                >

                    <div>
                        📦 Tổng:{" "}
                        <strong>
                            {stats.total}
                        </strong>
                    </div>

                    <div>
                        🟡 Chờ:{" "}
                        <strong>
                            {stats.waiting}
                        </strong>
                    </div>

                    <div>
                        🔵 Đang xử lý:{" "}
                        <strong>
                            {stats.processing}
                        </strong>
                    </div>

                    <div>
                        🟢 Thành công:{" "}
                        <strong>
                            {stats.success}
                        </strong>
                    </div>

                    <div>
                        🔴 Thất bại:{" "}
                        <strong>
                            {stats.failed}
                        </strong>
                    </div>

                </div>


                {failedJobs.length > 0 && (

                    <div
                        style={{
                            marginTop:
                                "15px",

                            padding:
                                "12px",

                            background:
                                "#fff3cd",

                            border:
                                "1px solid #ffe69c",

                            borderRadius:
                                "8px",
                        }}
                    >

                        ⚠️ Có{" "}
                        <strong>
                            {failedJobs.length}
                        </strong>{" "}
                        Job cần xử lý.

                    </div>

                )}

            </SectionCard>


            {/* =================================
                SIMULATION
            ================================= */}

            <div
                style={{
                    marginBottom:
                        "15px",

                    padding:
                        "12px 15px",

                    background:
                        "#fff8e1",

                    border:
                        "1px solid #ffe082",

                    borderRadius:
                        "8px",
                }}
            >

                ⚠️{" "}
                <strong>
                    Chế độ mô phỏng:
                </strong>{" "}

                Posting Engine hiện chưa đăng
                Facebook thật.

            </div>


            {/* =================================
                QUEUE
            ================================= */}

            <SectionCard
                title="🚀 Hàng đợi đăng"
            >

                {queue.length === 0 ? (

                    <div
                        style={{
                            textAlign:
                                "center",

                            padding:
                                "30px",

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

                            const fixAction =
                                job.status ===
                                    "failed"
                                    ? getQueueFixAction(
                                          job
                                      )
                                    : null;


                            return (

                                <div
                                    id={
                                        `queue-job-${job.id}`
                                    }

                                    key={
                                        job.id
                                    }

                                    style={{
                                        border:
                                            job.status ===
                                            "failed"
                                                ? "2px solid #e53935"
                                                : "1px solid #ddd",

                                        borderRadius:
                                            "12px",

                                        padding:
                                            "16px",

                                        marginBottom:
                                            "14px",

                                        background:
                                            "#fff",
                                    }}
                                >

                                    {/* =========================
                                        HEADER
                                    ========================= */}

                                    <div
                                        style={{
                                            display:
                                                "flex",

                                            justifyContent:
                                                "space-between",

                                            alignItems:
                                                "flex-start",

                                            gap:
                                                "10px",

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

                                                {
                                                    job.group?.name ||
                                                    "Không rõ nhóm"
                                                }

                                            </h3>


                                            <div
                                                style={{
                                                    fontSize:
                                                        "13px",

                                                    color:
                                                        "#777",
                                                }}
                                            >

                                                Job ID:{" "}
                                                {job.id}

                                            </div>

                                        </div>


                                        <strong>
                                            {
                                                getStatusLabel(
                                                    job.status
                                                )
                                            }
                                        </strong>

                                    </div>


                                    {/* =========================
                                        INFO
                                    ========================= */}

                                    <div
                                        style={{
                                            marginTop:
                                                "12px",

                                            display:
                                                "grid",

                                            gridTemplateColumns:
                                                "repeat(auto-fit, minmax(220px, 1fr))",

                                            gap:
                                                "8px",
                                        }}
                                    >

                                        <div>
                                            🚗 Car ID:{" "}
                                            <strong>
                                                {
                                                    job.carId ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            👤 Account ID:{" "}
                                            <strong>
                                                {
                                                    job.accountId ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            👥 Nhóm:{" "}
                                            <strong>
                                                {
                                                    job.group?.name ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            📷 Ảnh:{" "}
                                            <strong>
                                                {
                                                    job.imageCount ||
                                                    0
                                                }
                                            </strong>
                                        </div>

                                    </div>


                                    {/* =========================
                                        RETRY COUNT
                                    ========================= */}

                                    {Number(
                                        job.retryCount || 0
                                    ) > 0 && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "10px",

                                                padding:
                                                    "8px 10px",

                                                background:
                                                    "#fff8e1",

                                                borderRadius:
                                                    "7px",

                                                fontSize:
                                                    "14px",
                                            }}
                                        >

                                            🔄 Retry:{" "}
                                            <strong>
                                                {
                                                    job.retryCount
                                                }
                                                /
                                                {
                                                    maxRetries
                                                }
                                            </strong>

                                        </div>

                                    )}


                                    {/* =========================
                                        ERROR
                                    ========================= */}

                                    {job.status ===
                                        "failed" &&
                                        job.error && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "14px",

                                                padding:
                                                    "14px",

                                                background:
                                                    "#ffebee",

                                                border:
                                                    "1px solid #ef9a9a",

                                                borderRadius:
                                                    "10px",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    fontWeight:
                                                        "700",

                                                    color:
                                                        "#c62828",

                                                    marginBottom:
                                                        "7px",
                                                }}
                                            >

                                                ❌ Lý do thất bại

                                            </div>


                                            <div
                                                style={{
                                                    marginBottom:
                                                        "10px",
                                                }}
                                            >

                                                {
                                                    job.error
                                                }

                                            </div>


                                            {fixAction && (

                                                <div
                                                    style={{
                                                        padding:
                                                            "10px",

                                                        background:
                                                            "#fff",

                                                        borderRadius:
                                                            "8px",

                                                        marginBottom:
                                                            "10px",

                                                        fontSize:
                                                            "14px",
                                                    }}
                                                >

                                                    💡{" "}
                                                    {
                                                        fixAction.description ||
                                                        "Cần xử lý lỗi trước khi tiếp tục."
                                                    }

                                                </div>

                                            )}


                                            <div
                                                style={{
                                                    display:
                                                        "flex",

                                                    gap:
                                                        "8px",

                                                    flexWrap:
                                                        "wrap",
                                                }}
                                            >

                                                {fixAction &&
                                                    fixAction.route && (

                                                    <PrimaryButton
                                                        onClick={() =>
                                                            handleFixError(
                                                                job
                                                            )
                                                        }
                                                        style={{
                                                            background:
                                                                "#ff9800",
                                                        }}
                                                    >
                                                        {
                                                            fixAction.label ||
                                                            "🔧 Sửa lỗi"
                                                        }
                                                    </PrimaryButton>

                                                )}


                                                <PrimaryButton
                                                    onClick={() =>
                                                        handleRetry(
                                                            job
                                                        )
                                                    }
                                                    disabled={
                                                        processing ||
                                                        Number(
                                                            job.retryCount ||
                                                            0
                                                        ) >=
                                                            maxRetries
                                                    }
                                                >
                                                    🔄 Thử lại
                                                </PrimaryButton>

                                            </div>

                                        </div>

                                    )}


                                    {/* =========================
                                        LOG
                                    ========================= */}

                                    {Array.isArray(
                                        job.logs
                                    ) &&
                                        job.logs.length >
                                            0 && (

                                        <details
                                            style={{
                                                marginTop:
                                                    "14px",
                                            }}
                                        >

                                            <summary
                                                style={{
                                                    cursor:
                                                        "pointer",

                                                    fontWeight:
                                                        "600",
                                                }}
                                            >
                                                📜 Nhật ký xử lý
                                                (
                                                {
                                                    job.logs.length
                                                }
                                                )
                                            </summary>


                                            <div
                                                style={{
                                                    marginTop:
                                                        "10px",

                                                    padding:
                                                        "10px",

                                                    background:
                                                        "#f7f7f7",

                                                    border:
                                                        "1px solid #e0e0e0",

                                                    borderRadius:
                                                        "8px",
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
                                                                    "6px 0",

                                                                borderBottom:
                                                                    logIndex <
                                                                    job.logs.length -
                                                                        1
                                                                        ? "1px solid #eee"
                                                                        : "none",

                                                                fontSize:
                                                                    "13px",
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
                                                                        "11px",
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

                                        </details>

                                    )}


                                    {/* =========================
                                        SUCCESS
                                    ========================= */}

                                    {job.status ===
                                        "success" && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "12px",

                                                padding:
                                                    "10px",

                                                background:
                                                    "#e8f5e9",

                                                border:
                                                    "1px solid #a5d6a7",

                                                borderRadius:
                                                    "8px",

                                                color:
                                                    "#2e7d32",

                                                fontSize:
                                                    "14px",
                                            }}

                                            >

                                                {/* =================================
    DEV ERROR TEST
================================= */}

{import.meta.env.DEV && (

    <SectionCard
        title="🧪 DEV — Test Error Handling"
    >

        <div
            style={{
                padding: "12px",
                marginBottom: "12px",
                background: "#fff8e1",
                border: "1px solid #ffe082",
                borderRadius: "8px",
                fontSize: "14px",
            }}
        >

            ⚠️{" "}
            <strong>
                Chỉ dùng để kiểm tra hệ thống.
            </strong>{" "}

            Các Job bên dưới là Job giả,
            không đăng Facebook thật.

        </div>


        <div
            style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
            }}
        >

            {getFacebookQueueTestTypes().map(
                (test) => (

                    <PrimaryButton
                        key={test.type}
                        onClick={() =>
                            handleCreateTestJob(
                                test.type
                            )
                        }
                        disabled={
                            processing
                        }
                        style={{
                            background:
                                "#6a1b9a",
                        }}
                    >
                        {test.label}
                    </PrimaryButton>

                )
            )}

            <PrimaryButton
                onClick={
                    handleClearTestJobs
                }
                disabled={
                    processing
                }
                style={{
                    background:
                        "#777",
                }}
            >
                🧹 Xóa toàn bộ Job Test
            </PrimaryButton>

        </div>


        <p
            style={{
                marginBottom: 0,
                marginTop: "12px",
                color: "#777",
                fontSize: "13px",
            }}
        >

            💡 Hãy test từng loại lỗi để kiểm tra
            nút 🔧 Sửa lỗi → màn hình tương ứng.

        </p>

    </SectionCard>

)}

                                            🟢 Job hoàn tất.

                                            {
                                                job.result?.published ===
                                                true
                                                    ? " Đã đăng Facebook thật."
                                                    : " Đây là kết quả Simulation."
                                            }

                                        </div>

                                    )}





                                    {/* =========================
                                        ACTIONS
                                    ========================= */}

                                    <div
                                        style={{
                                            display:
                                                "flex",

                                            gap:
                                                "8px",

                                            flexWrap:
                                                "wrap",

                                            marginTop:
                                                "15px",
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
                                                    processing ||
                                                    Number(
                                                        job.retryCount ||
                                                        0
                                                    ) >=
                                                        maxRetries
                                                }
                                            >
                                                🔄 Thử lại
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
                                            style={{
                                                background:
                                                    "#777",
                                            }}
                                        >
                                            🗑️ Xóa
                                        </PrimaryButton>

                                    </div>

                                </div>
                            );
                        }
                    )

                )}


                {/* =========================
                    BOTTOM
                ========================= */}

                {queue.length > 0 && (

                    <div
                        style={{
                            display:
                                "flex",

                            gap:
                                "10px",

                            flexWrap:
                                "wrap",

                            marginTop:
                                "15px",

                            paddingTop:
                                "15px",

                            borderTop:
                                "1px solid #eee",
                        }}
                    >

                        <PrimaryButton
                            onClick={
                                handleProcessAll
                            }
                            disabled={
                                processing ||
                                waitingJobs.length ===
                                    0
                            }
                        >
                            {processing
                                ? "⏳ Worker đang chạy..."
                                : `🚀 Chạy ${waitingJobs.length} bài`}
                        </PrimaryButton>


                        <PrimaryButton
                            onClick={
                                handleClear
                            }
                            disabled={
                                processing
                            }
                            style={{
                                background:
                                    "#777",
                            }}
                        >
                            🗑️ Xóa toàn bộ Queue
                        </PrimaryButton>

                    </div>

                )}

            </SectionCard>

        </main>
    );
}


export default FacebookPostingQueue;