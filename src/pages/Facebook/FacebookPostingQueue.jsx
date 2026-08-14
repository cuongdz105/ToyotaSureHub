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
    prepareManualPostingJob,
    confirmManualPosted,
    cancelManualPostingJob,
} from "../../services/facebookPostingQueueService";

import {
    processFacebookJob,
    getMaxRetries,
} from "../../services/facebookPostingWorkerService";

import {
    getQueueFixAction,
} from "../../services/facebookQueueErrorService";

const CAR_STORAGE_KEY = "toyota_sure_hub_cars";

function loadCars() {
    try {
        const data = localStorage.getItem(CAR_STORAGE_KEY);

        if (!data) {
            return [];
        }

        const cars = JSON.parse(data);

        return Array.isArray(cars) ? cars : [];
    } catch (error) {
        console.error(
            "Không đọc được danh sách xe:",
            error
        );

        return [];
    }
}

function formatOdo(odo) {
    if (
        odo === null ||
        odo === undefined ||
        odo === ""
    ) {
        return "";
    }

    if (
        typeof odo === "string" &&
        odo.toLowerCase().includes("vạn")
    ) {
        return odo;
    }

    const value = Number(odo);

    if (Number.isNaN(value)) {
        return String(odo);
    }

    const van = value / 10000;

    return `${Number.isInteger(van)
        ? van
        : van.toFixed(1).replace(/\\.0$/, "")
    } vạn km`;
}

function FacebookPostingQueue() {

    const navigate = useNavigate();

    const [queue, setQueue] = useState([]);

    const [cars, setCars] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        waiting: 0,
        processing: 0,
        manualReady: 0,
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

        setCars(loadCars());
    }


    useEffect(() => {
        refresh();
    }, []);


    // ==========================================
    // TÌM XE THEO CAR ID
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


    function getValidCarImages(car) {
        if (!car || !Array.isArray(car.images)) {
            return [];
        }

        return car.images.filter((image) => {
            if (typeof image === "string") {
                return image.trim() !== "";
            }

            return Boolean(
                image &&
                typeof image === "object" &&
                image.preview
            );
        });
    }


    function getImageSrc(image) {
        if (typeof image === "string") {
            return image;
        }

        return image?.preview || "";
    }


    function getPostingImages(job) {
        const car = getCar(job);
        const images = getValidCarImages(car);

        if (images.length === 0) {
            return [];
        }

        const indexes = Array.isArray(job.variation?.imageIndexes)
            ? job.variation.imageIndexes
                  .map((index) => Number(index))
                  .filter(
                      (index) =>
                          Number.isInteger(index) &&
                          index >= 0 &&
                          index < images.length
                  )
            : [];

        if (indexes.length === 0) {
            return images.map((image, index) => ({
                image,
                originalIndex: index,
            }));
        }

        return indexes.map((index) => ({
            image: images[index],
            originalIndex: index,
        }));
    }


    async function handleCopyContent(job) {
        try {
            await navigator.clipboard.writeText(job.content || "");
            alert("📋 Đã copy nội dung Facebook.");
        } catch (error) {
            console.error("Copy content error:", error);
            alert("❌ Không copy được nội dung. Ông có thể bôi đen và copy thủ công.");
        }
    }


    function handleOpenFacebook(job) {
        const url = job.group?.url;

        if (!url) {
            alert("❌ Job chưa có link Facebook của nhóm.");
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");
    }


    function handleOpenImage(image) {
        const src = getImageSrc(image);

        if (!src) {
            return;
        }

        window.open(src, "_blank", "noopener,noreferrer");
    }


    function handleDownloadImage(image, job, index) {
        const src = getImageSrc(image);

        if (!src) {
            return;
        }

        const link = document.createElement("a");
        link.href = src;
        link.download = `ToyotaSureHub_${job.id}_${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    async function handlePrepareManualJob(job) {
        if (processing) {
            return;
        }

        try {
            const prepared = prepareManualPostingJob(job.id);

            // Copy sẵn caption vào clipboard ngay từ thao tác của ông.
            // Khi Facebook mở ra, ông chỉ cần Ctrl+V.
            try {
                await navigator.clipboard.writeText(job.content || "");
            } catch (clipboardError) {
                console.warn("Không copy được caption tự động:", clipboardError);
            }

            refresh();

            if (prepared?.group?.url) {
                window.open(
                    prepared.group.url,
                    "_blank",
                    "noopener,noreferrer"
                );
            } else {
                alert("⚠️ Đã chuẩn bị bài nhưng Job chưa có link Facebook của nhóm.");
            }
        } catch (error) {
            console.error("Manual Prepare Error:", error);
            alert(
                "❌ Không thể chuẩn bị bài:\n\n" +
                    (error?.message || "Lỗi không xác định.")
            );
            refresh();
        }
    }


    function handleConfirmManualPosted(job) {
        if (!window.confirm(
            "Ông đã thực sự bấm Đăng trên Facebook chưa?\n\n" +
            "Chỉ bấm OK nếu bài đã được gửi lên nhóm."
        )) {
            return;
        }

        try {
            confirmManualPosted(job.id);
            refresh();
        } catch (error) {
            console.error("Confirm Manual Posted Error:", error);
            alert(
                "❌ Không thể xác nhận:\n\n" +
                    (error?.message || "Lỗi không xác định.")
            );
        }
    }


    function handleCancelManual(job) {
        try {
            cancelManualPostingJob(job.id);
            refresh();
        } catch (error) {
            console.error("Cancel Manual Error:", error);
            alert(
                "❌ Không thể đưa Job về chờ:\n\n" +
                    (error?.message || "Lỗi không xác định.")
            );
        }
    }


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
    // PREPARE ALL FOR MANUAL POSTING
    // ==========================================

    function handlePrepareAllManual() {
        if (processing || waitingJobs.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            `Chuẩn bị ${waitingJobs.length} bài để ông đăng thủ công trên Facebook?\n\n` +
            "ToyotaSureHub sẽ KHÔNG tự đánh dấu thành công và KHÔNG tự bấm Đăng Facebook."
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessing(true);

            waitingJobs.forEach((job) => {
                prepareManualPostingJob(job.id);
            });

            refresh();

            alert(
                `🟠 Đã chuẩn bị ${waitingJobs.length} bài.\n\n` +
                "Ông mở từng Job, copy nội dung/chọn ảnh và đăng trên Facebook."
            );
        } catch (error) {
            console.error("Prepare All Manual Error:", error);
            alert(
                "❌ Không thể chuẩn bị Queue:\n\n" +
                    (error?.message || "Lỗi không xác định.")
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

            case "manual_ready":
                return "🟠 Chờ ông đăng Facebook";

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

    const manualReadyJobs =
        queue.filter(
            (job) =>
                job.status ===
                "manual_ready"
        );


    const maxRetries =
        getMaxRetries();

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
                            handlePrepareAllManual
                        }
                        disabled={
                            processing ||
                            waitingJobs.length ===
                            0
                        }
                    >
                        {processing
                            ? "⏳ Đang chuẩn bị..."
                            : `🟠 Chuẩn bị ${waitingJobs.length} bài`}
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
                        🟠 Chờ đăng:{" "}
                        <strong>
                            {stats.manualReady ?? manualReadyJobs.length}
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
                    Manual Posting V11:
                </strong>{" "}

                ToyotaSureHub chỉ chuẩn bị nội dung + đúng bộ ảnh + mở đúng nhóm.
                Ông phải tự bấm <strong>Đăng</strong> trên Facebook rồi mới xác nhận thành công.

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

                                            {(() => {
                                                const car = getCar(job);

                                                return (
                                                    <>
                                                        <h3
                                                            style={{
                                                                marginTop:
                                                                    0,

                                                                marginBottom:
                                                                    "6px",
                                                            }}
                                                        >
                                                            #{index + 1}{" "}
                                                            {car ? (
                                                                <>
                                                                    🚗{" "}
                                                                    <strong>
                                                                        {car.brand || ""}{" "}
                                                                        {car.model || ""}{" "}
                                                                        {car.version || ""}{" "}
                                                                        {car.year || ""}
                                                                    </strong>

                                                                    {car.color
                                                                        ? ` màu ${car.color}`
                                                                        : ""}

                                                                    {car.odo !== undefined &&
                                                                    car.odo !== null &&
                                                                    car.odo !== ""
                                                                        ? ` — ${formatOdo(car.odo)}`
                                                                        : ""}
                                                                </>
                                                            ) : (
                                                                `🚗 Không tìm thấy thông tin xe — Car ID: ${
                                                                    job.carId || "-"
                                                                }`
                                                            )}
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
                                                            {" · "}
                                                            👥{" "}
                                                            {job.group?.name ||
                                                                "Không rõ nhóm"}
                                                        </div>
                                                    </>
                                                );
                                            })()}

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
                                            🆔 Car ID:{" "}
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
                                        MANUAL POSTING PANEL
                                    ========================= */}

                                    {job.status === "manual_ready" && (() => {
                                        const postingImages = getPostingImages(job);

                                        return (
                                            <div
                                                style={{
                                                    marginTop: "14px",
                                                    padding: "15px",
                                                    background: "#fff8e1",
                                                    border: "2px solid #f0c36d",
                                                    borderRadius: "10px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        gap: "10px",
                                                        flexWrap: "wrap",
                                                        marginBottom: "12px",
                                                    }}
                                                >
                                                    <strong style={{ fontSize: "16px" }}>
                                                        🟠 CHỜ ÔNG ĐĂNG FACEBOOK
                                                    </strong>

                                                    <span style={{ color: "#795548", fontSize: "13px" }}>
                                                        ToyotaSureHub chưa coi đây là thành công.
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                        flexWrap: "wrap",
                                                        marginBottom: "12px",
                                                    }}
                                                >
                                                    <PrimaryButton
                                                        onClick={() => handleOpenFacebook(job)}
                                                    >
                                                        🌐 Mở lại Facebook
                                                    </PrimaryButton>

                                                    <PrimaryButton
                                                        onClick={() => handleCopyContent(job)}
                                                    >
                                                        📋 Copy nội dung
                                                    </PrimaryButton>
                                                </div>

                                                <div
                                                    style={{
                                                        padding: "12px",
                                                        background: "#fff",
                                                        border: "1px solid #ddd",
                                                        borderRadius: "8px",
                                                        whiteSpace: "pre-wrap",
                                                        lineHeight: "1.55",
                                                        maxHeight: "260px",
                                                        overflowY: "auto",
                                                    }}
                                                >
                                                    {job.content || "(Không có nội dung)"}
                                                </div>

                                                <div style={{ marginTop: "14px", marginBottom: "8px" }}>
                                                    📷 <strong>Bộ ảnh đăng ({postingImages.length} ảnh)</strong>
                                                    {job.variation?.imageIndexes?.length > 0 && (
                                                        <span style={{ marginLeft: "8px", color: "#777", fontSize: "13px" }}>
                                                            · Đã khóa theo Variation của Job
                                                        </span>
                                                    )}
                                                </div>

                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                                                        gap: "10px",
                                                    }}
                                                >
                                                    {postingImages.map(({ image }, imageIndex) => {
                                                        const src = getImageSrc(image);

                                                        return (
                                                            <div
                                                                key={`${job.id}-manual-image-${imageIndex}`}
                                                                style={{
                                                                    border: "1px solid #ddd",
                                                                    borderRadius: "8px",
                                                                    padding: "6px",
                                                                    background: "#fff",
                                                                }}
                                                            >
                                                                <img
                                                                    src={src}
                                                                    alt={`Ảnh ${imageIndex + 1}`}
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "110px",
                                                                        objectFit: "cover",
                                                                        borderRadius: "6px",
                                                                        display: "block",
                                                                        cursor: "pointer",
                                                                    }}
                                                                    onClick={() => handleOpenImage(image)}
                                                                />

                                                                <div
                                                                    style={{
                                                                        fontSize: "12px",
                                                                        marginTop: "5px",
                                                                        textAlign: "center",
                                                                        color: "#666",
                                                                    }}
                                                                >
                                                                    Ảnh {imageIndex + 1}
                                                                </div>

                                                                <PrimaryButton
                                                                    onClick={() => handleDownloadImage(image, job, imageIndex)}
                                                                    style={{
                                                                        width: "100%",
                                                                        marginTop: "5px",
                                                                        padding: "6px 8px",
                                                                        fontSize: "12px",
                                                                    }}
                                                                >
                                                                    ⬇️ Tải ảnh
                                                                </PrimaryButton>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div
                                                    style={{
                                                        marginTop: "14px",
                                                        padding: "10px",
                                                        background: "#fff3cd",
                                                        border: "1px solid #ffe69c",
                                                        borderRadius: "8px",
                                                        fontSize: "13px",
                                                    }}
                                                >
                                                    ⚠️ Sau khi Facebook thực sự hiện bài trong nhóm, ông mới bấm
                                                    <strong> "Đã đăng thành công"</strong>.
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                        flexWrap: "wrap",
                                                        marginTop: "12px",
                                                    }}
                                                >
                                                    <PrimaryButton
                                                        onClick={() => handleConfirmManualPosted(job)}
                                                    >
                                                        ✅ Đã đăng thành công
                                                    </PrimaryButton>

                                                    <PrimaryButton
                                                        onClick={() => handleCancelManual(job)}
                                                        style={{ background: "#777" }}
                                                    >
                                                        ↩️ Chưa đăng / Để sau
                                                    </PrimaryButton>
                                                </div>
                                            </div>
                                        );
                                    })()}


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


                                            🟢 Job hoàn tất.

                                            {
                                                job.result?.confirmedByUser === true
                                                    ? " Ông đã xác nhận đã đăng Facebook."
                                                    : job.result?.published === true
                                                        ? " Đã ghi nhận đã đăng Facebook."
                                                        : " Chưa có xác nhận đăng Facebook."
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
                                                    handlePrepareManualJob(
                                                        job
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
                                            "manual_ready" && (

                                            <PrimaryButton
                                                onClick={() =>
                                                    handleOpenFacebook(
                                                        job
                                                    )
                                                }
                                            >
                                                🌐 Mở Facebook
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
                                handlePrepareAllManual
                            }
                            disabled={
                                processing ||
                                waitingJobs.length ===
                                    0
                            }
                        >
                            {processing
                                ? "⏳ Đang chuẩn bị..."
                                : `🟠 Chuẩn bị ${waitingJobs.length} bài`}
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