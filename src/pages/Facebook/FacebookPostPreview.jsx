import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionCard from "../../components/Common/SectionCard";
import PrimaryButton from "../../components/Common/PrimaryButton";

import {
    getCurrentPosting,
} from "../../services/postingSessionService";

import {
    addToPostingQueue,
    loadPostingQueue,
    updateQueueJob,
} from "../../services/facebookPostingQueueService";

import {
    loadAccounts,
    getDefaultAccount,
} from "../../services/facebookAccountService";

import {
    generateFacebookPost,
} from "../../services/aiService";


function FacebookPostPreview() {

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [postingCar, setPostingCar] =
        useState(null);

    const [group, setGroup] =
        useState(null);

    const [content, setContent] =
        useState("");

    const [addingToQueue, setAddingToQueue] =
        useState(false);

    const [savingEdit, setSavingEdit] =
        useState(false);

    const [generatingAI, setGeneratingAI] =
        useState(false);

    const [accounts, setAccounts] =
        useState([]);

    const [selectedAccountId, setSelectedAccountId] =
        useState("");


    // ==========================================
    // EDIT MODE
    // ==========================================

    const [editMode, setEditMode] =
        useState(false);

    const [editJobId, setEditJobId] =
        useState("");

    const [editJob, setEditJob] =
        useState(null);


    // ==========================================
    // LOAD DỮ LIỆU
    // ==========================================

    useEffect(() => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const returnTo =
            params.get("returnTo");

        const jobId =
            params.get("jobId");


        const isEditMode =
            returnTo === "queue" &&
            !!jobId;


        setEditMode(isEditMode);

        if (isEditMode) {
            setEditJobId(jobId);
        }


        // --------------------------------------
        // LOAD CURRENT POSTING CAR
        // --------------------------------------

        const car =
            getCurrentPosting();

        setPostingCar(car);


        // --------------------------------------
        // LOAD FACEBOOK ACCOUNTS
        // --------------------------------------

        const savedAccounts =
            loadAccounts();

        setAccounts(
            savedAccounts
        );


        // --------------------------------------
        // LOAD DEFAULT ACCOUNT
        // --------------------------------------

        const defaultAccount =
            getDefaultAccount();


        if (defaultAccount) {

            setSelectedAccountId(
                String(
                    defaultAccount.id
                )
            );

        } else if (
            savedAccounts.length > 0
        ) {

            setSelectedAccountId(
                String(
                    savedAccounts[0].id
                )
            );

        }


        // --------------------------------------
        // LOAD GROUP
        // --------------------------------------

        const savedGroup =
            sessionStorage.getItem(
                "toyota_sure_selected_group"
            );


        if (savedGroup) {

            try {

                setGroup(
                    JSON.parse(
                        savedGroup
                    )
                );

            } catch (error) {

                console.error(
                    "Không đọc được nhóm Facebook:",
                    error
                );

            }

        }


        // --------------------------------------
        // EDIT MODE:
        // LOAD JOB CŨ
        // --------------------------------------

        if (isEditMode) {

            const queue =
                loadPostingQueue();

            const existingJob =
                queue.find(
                    (job) =>
                        String(job.id) ===
                        String(jobId)
                );


            if (!existingJob) {

                console.error(
                    "Không tìm thấy Facebook Queue Job:",
                    jobId
                );

                alert(
                    "❌ Không tìm thấy Job Facebook cần sửa."
                );

                navigate(
                    "/facebook/queue"
                );

                return;

            }


            console.log(
                "📝 EDIT FACEBOOK QUEUE JOB:",
                existingJob
            );


            setEditJob(
                existingJob
            );


            // ----------------------------------
            // LOAD CONTENT CỦA JOB CŨ
            // ----------------------------------

            setContent(
                existingJob.content ||
                ""
            );


            // ----------------------------------
            // LOAD ACCOUNT CỦA JOB CŨ
            // ----------------------------------

            if (
                existingJob.accountId !==
                undefined &&
                existingJob.accountId !==
                null
            ) {

                setSelectedAccountId(
                    String(
                        existingJob.accountId
                    )
                );

            }


            // ----------------------------------
            // LOAD GROUP CỦA JOB CŨ
            // ----------------------------------

            if (
                existingJob.group
            ) {

                setGroup(
                    existingJob.group
                );


                sessionStorage.setItem(
                    "toyota_sure_selected_group",
                    JSON.stringify(
                        existingJob.group
                    )
                );

            }


            return;
        }


        // --------------------------------------
        // NORMAL MODE:
        // LOAD AI CONTENT CŨ
        // --------------------------------------

        if (
            car?.aiContent?.facebook
        ) {

            setContent(
                car.aiContent.facebook
            );

        }

    }, [navigate]);


    // ==========================================
    // KIỂM TRA ACCOUNT CÓ ĐƯỢC PHÉP GROUP
    // ==========================================

    function isAccountAllowedForGroup(
        account,
        currentGroup
    ) {

        if (
            !account ||
            !currentGroup
        ) {

            return false;

        }


        // Account phải active

        if (
            account.status !==
            "active"
        ) {

            return false;

        }


        const groupId =
            String(
                currentGroup.id
            );


        // --------------------------------------
        // MODE 1:
        // TẤT CẢ NHÓM
        // --------------------------------------

        if (
            account.allowAllGroups !==
            false
        ) {

            const excludedGroupIds =
                Array.isArray(
                    account.excludedGroupIds
                )
                    ? account.excludedGroupIds
                    : [];


            return !excludedGroupIds.some(
                (id) =>
                    String(id) ===
                    groupId
            );

        }


        // --------------------------------------
        // MODE 2:
        // CHỈ NHÓM ĐƯỢC CHỌN
        // --------------------------------------

        const allowedGroupIds =
            Array.isArray(
                account.allowedGroupIds
            )
                ? account.allowedGroupIds
                : [];


        return allowedGroupIds.some(
            (id) =>
                String(id) ===
                groupId
        );

    }


    // ==========================================
    // ACCOUNT ĐƯỢC PHÉP ĐĂNG
    // ==========================================

    const allowedAccounts =
        group
            ? accounts.filter(
                  (account) =>
                      isAccountAllowedForGroup(
                          account,
                          group
                      )
              )
            : [];


    // ==========================================
    // TỰ CHỌN ACCOUNT HỢP LỆ
    // ==========================================

    useEffect(() => {

        // --------------------------------------
        // EDIT MODE:
        // ƯU TIÊN ACCOUNT CỦA JOB
        // --------------------------------------

        if (
            editMode &&
            editJob?.accountId !==
                undefined &&
            editJob?.accountId !==
                null
        ) {

            const jobAccountStillAllowed =
                allowedAccounts.some(
                    (account) =>
                        String(
                            account.id
                        ) ===
                        String(
                            editJob.accountId
                        )
                );


            if (
                jobAccountStillAllowed
            ) {

                setSelectedAccountId(
                    String(
                        editJob.accountId
                    )
                );

                return;

            }

        }


        // --------------------------------------
        // NORMAL ACCOUNT LOGIC
        // --------------------------------------

        if (!group) {
            return;
        }


        if (
            allowedAccounts.length ===
            0
        ) {

            setSelectedAccountId(
                ""
            );

            return;

        }


        const currentAccountStillAllowed =
            allowedAccounts.some(
                (account) =>
                    String(
                        account.id
                    ) ===
                    String(
                        selectedAccountId
                    )
            );


        if (
            currentAccountStillAllowed
        ) {

            return;

        }


        const defaultAccount =
            allowedAccounts.find(
                (account) =>
                    account.isDefault
            );


        if (defaultAccount) {

            setSelectedAccountId(
                String(
                    defaultAccount.id
                )
            );

            return;

        }


        setSelectedAccountId(
            String(
                allowedAccounts[0].id
            )
        );

    }, [
        group,
        accounts,
        selectedAccountId,
        editMode,
        editJob,
        allowedAccounts,
    ]);


    // ==========================================
    // CHƯA CÓ XE
    // ==========================================

    if (!postingCar) {

        return (

            <main className="content">

                <h1>
                    {editMode
                        ? "📝 Sửa Facebook Queue"
                        : "🚀 Facebook Posting"}
                </h1>


                <SectionCard
                    title="⚠️ Chưa có xe"
                >

                    <p>
                        Chưa có chiếc xe nào
                        được chọn để đăng.
                    </p>


                    <p
                        style={{
                            color: "#666",
                        }}
                    >
                        {editMode
                            ? "Job vẫn tồn tại trong Queue, nhưng phiên đăng hiện tại không còn thông tin chiếc xe."
                            : "Hãy chọn một chiếc xe trước khi tạo bài đăng Facebook."}
                    </p>


                    <PrimaryButton
                        onClick={() =>
                            navigate(
                                "/facebook/queue"
                            )
                        }
                    >
                        📋 Quay lại Facebook Queue
                    </PrimaryButton>

                </SectionCard>

            </main>

        );

    }


    // ==========================================
    // ẢNH XE
    // ==========================================

    const images =
        Array.isArray(
            postingCar.images
        )
            ? postingCar.images
            : [];


    function getImageSrc(
        image
    ) {

        if (
            typeof image ===
            "string"
        ) {

            return image;

        }


        return (
            image?.preview ||
            ""
        );

    }


    // ==========================================
    // TẠO FACEBOOK CONTENT BẰNG AI
    // ==========================================

    async function handleGenerateAI() {

        if (
            generatingAI
        ) {

            return;

        }


        if (
            !postingCar
        ) {

            alert(
                "⚠️ Chưa có xe để tạo nội dung."
            );

            return;

        }


        try {

            setGeneratingAI(
                true
            );


            /*
             * Gọi AI Service hiện có
             */

            const result =
                await generateFacebookPost(
                    postingCar
                );


            /*
             * Hỗ trợ nhiều kiểu response
             * để không phụ thuộc cứng vào
             * Mock AI / API sau này.
             */

            let generatedContent =
                "";


            if (
                typeof result ===
                "string"
            ) {

                generatedContent =
                    result;

            } else if (
                result?.content
            ) {

                generatedContent =
                    result.content;

            } else if (
                result?.text
            ) {

                generatedContent =
                    result.text;

            } else if (
                result?.facebook
            ) {

                generatedContent =
                    result.facebook;

            }


            if (
                !generatedContent?.trim()
            ) {

                throw new Error(
                    "AI không trả về nội dung Facebook."
                );

            }


            setContent(
                generatedContent.trim()
            );


            alert(
                "🤖 Đã tạo nội dung Facebook bằng AI."
            );

        } catch (error) {

            console.error(
                "Lỗi tạo Facebook AI:",
                error
            );


            alert(
                "❌ Không thể tạo nội dung Facebook:\n\n" +
                    (
                        error?.message ||
                        "Lỗi không xác định."
                    )
            );

        } finally {

            setGeneratingAI(
                false
            );

        }

    }


    // ==========================================
    // LƯU NỘI DUNG JOB CŨ
    // ==========================================

    function handleSaveEdit() {

        if (
            !editMode
        ) {

            return;

        }


        if (
            !editJobId
        ) {

            alert(
                "❌ Không xác định được Job cần sửa."
            );

            return;

        }


        if (
            !content.trim()
        ) {

            alert(
                "⚠️ Nội dung Facebook đang trống.\n\nÔng hãy nhập nội dung trước khi lưu."
            );

            return;

        }


        try {

            setSavingEdit(
                true
            );


            // ----------------------------------
            // KIỂM TRA JOB CÒN TỒN TẠI
            // ----------------------------------

            const queue =
                loadPostingQueue();


            const existingJob =
                queue.find(
                    (job) =>
                        String(job.id) ===
                        String(editJobId)
                );


            if (!existingJob) {

                throw new Error(
                    "Không tìm thấy Job trong Facebook Queue."
                );

            }


            // ----------------------------------
            // XÁC ĐỊNH ACCOUNT
            // ----------------------------------

            const accountId =
                selectedAccountId
                    ? Number(
                          selectedAccountId
                      )
                    : existingJob.accountId;


            // ----------------------------------
            // UPDATE JOB CŨ
            // ----------------------------------

            const updatedJob =
                updateQueueJob(
                    editJobId,
                    {

                        // Nội dung mới
                        content:
                            content.trim(),

                        // Account giữ nguyên
                        // nếu có
                        accountId:
                            accountId,

                        // Group giữ nguyên
                        // theo Job cũ
                        group:
                            group ||
                            existingJob.group,

                        // Khi sửa xong:
                        // cho Job quay lại waiting
                        status:
                            "waiting",

                        // Xóa lỗi cũ
                        error:
                            null,

                        // Xóa kết quả
                        // của lần chạy trước
                        result:
                            null,

                        // Reset retry
                        retryCount:
                            0,

                        // Đánh dấu thời điểm
                        // sửa nội dung
                        editedAt:
                            new Date().toISOString(),

                    }
                );


            if (
                !updatedJob
            ) {

                throw new Error(
                    "Không cập nhật được Job trong Queue."
                );

            }


            console.log(
                "✅ Đã cập nhật Facebook Queue Job:",
                updatedJob
            );


            alert(
                "✅ Đã lưu nội dung vào Job cũ!\n\n" +
                "Job đã được đưa trở lại trạng thái CHỜ XỬ LÝ."
            );


            // ----------------------------------
            // QUAY LẠI QUEUE
            // ----------------------------------

            navigate(
                `/facebook/queue?focusJobId=${encodeURIComponent(
                    editJobId
                )}`
            );


        } catch (error) {

            console.error(
                "❌ Lỗi lưu nội dung Facebook Queue Job:",
                error
            );


            alert(
                "❌ Không thể lưu nội dung Job:\n\n" +
                    (
                        error?.message ||
                        "Lỗi không xác định."
                    )
            );

        } finally {

            setSavingEdit(
                false
            );

        }

    }


    // ==========================================
    // HỦY SỬA
    // ==========================================

    function handleCancelEdit() {

        if (
            editMode &&
            editJobId
        ) {

            navigate(
                `/facebook/queue?focusJobId=${encodeURIComponent(
                    editJobId
                )}`
            );

            return;

        }


        navigate(
            "/facebook/queue"
        );

    }


    // ==========================================
    // THÊM VÀO QUEUE
    // ==========================================

    function handleAddToQueue() {

        if (
            editMode
        ) {

            handleSaveEdit();

            return;

        }


        if (!group) {

            alert(
                "⚠️ Chưa chọn hội nhóm."
            );

            return;

        }


        if (
            allowedAccounts.length ===
            0
        ) {

            alert(
                "⚠️ Không có tài khoản Facebook nào được phép đăng vào nhóm này."
            );

            return;

        }


        if (
            !selectedAccountId
        ) {

            alert(
                "⚠️ Chưa chọn tài khoản Facebook."
            );

            return;

        }


        const selectedAccount =
            allowedAccounts.find(
                (account) =>
                    String(
                        account.id
                    ) ===
                    String(
                        selectedAccountId
                    )
            );


        if (
            !selectedAccount
        ) {

            alert(
                "⚠️ Tài khoản Facebook đã chọn không được phép đăng vào nhóm này."
            );

            return;

        }


        if (
            images.length ===
            0
        ) {

            alert(
                "⚠️ Xe chưa có ảnh."
            );

            return;

        }


        if (
            !content.trim()
        ) {

            alert(
                "⚠️ Chưa có nội dung Facebook.\n\nÔng hãy bấm 'Tạo nội dung bằng AI' hoặc nhập nội dung thủ công."
            );

            return;

        }


        try {

            setAddingToQueue(
                true
            );


            const job =
                addToPostingQueue({

                    carId:
                        postingCar.id,

                    group,

                    content,

                    imageCount:
                        images.length,

                    accountId:
                        Number(
                            selectedAccountId
                        ),

                });


            console.log(
                "✅ Facebook Queue Job:",
                job
            );


            alert(
                "✅ Đã thêm bài đăng vào Queue!\n\n" +

                `🚗 Xe: ${postingCar.brand || ""} ${postingCar.model || ""}\n` +

                `👤 Tài khoản: ${selectedAccount.name}\n` +

                `👥 Nhóm: ${group.name}\n` +

                `📷 Ảnh: ${images.length}`
            );


            navigate(
                "/facebook/queue"
            );


        } catch (error) {

            console.error(
                "Lỗi thêm vào Facebook Queue:",
                error
            );


            alert(
                "❌ Không thể thêm vào Queue:\n\n" +
                    (
                        error?.message ||
                        "Lỗi không xác định."
                    )
            );

        } finally {

            setAddingToQueue(
                false
            );

        }

    }


    // ==========================================
    // ACCOUNT ĐANG CHỌN
    // ==========================================

    const selectedAccount =
        allowedAccounts.find(
            (account) =>
                String(
                    account.id
                ) ===
                String(
                    selectedAccountId
                )
        );


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <main className="content">


            {/* =================================
                HEADER
            ================================= */}

            <h1>

                {editMode
                    ? "📝 Sửa bài Facebook trong Queue"
                    : "🚀 Facebook Posting"}

            </h1>


            {editMode && (

                <div
                    style={{
                        marginBottom:
                            "16px",

                        padding:
                            "14px",

                        background:
                            "#e3f2fd",

                        border:
                            "1px solid #90caf9",

                        borderRadius:
                            "8px",

                        color:
                            "#1565c0",
                    }}
                >

                    <strong>
                        📝 CHẾ ĐỘ SỬA JOB
                    </strong>

                    <div
                        style={{
                            marginTop:
                                "6px",
                        }}
                    >

                        Ông đang chỉnh sửa nội dung
                        của Job hiện có trong
                        Facebook Queue.

                        <br />

                        <strong>
                            Không tạo Job mới.
                        </strong>

                    </div>

                </div>

            )}


            {/* =================================
                XE
            ================================= */}

            <SectionCard
                title="🚗 Xe đang đăng"
            >

                <h2>

                    {
                        postingCar.brand
                    }{" "}

                    {
                        postingCar.model
                    }

                </h2>


                <p>

                    {
                        postingCar.version
                    }

                    {" · "}

                    {
                        postingCar.year
                    }

                    {
                        postingCar.color
                            ? ` · ${postingCar.color}`
                            : ""
                    }

                </p>

            </SectionCard>


            {/* =================================
                GROUP
            ================================= */}

            {group && (

                <SectionCard
                    title="👥 Nhóm đăng"
                >

                    <h2>
                        {
                            group.name
                        }
                    </h2>


                    <p>

                        ⭐ Độ phù hợp:{" "}

                        <strong>

                            {
                                group.matchScore ||
                                0
                            }
                            %

                        </strong>

                    </p>


                    {group.url && (

                        <PrimaryButton
                            onClick={() =>
                                window.open(
                                    group.url,
                                    "_blank"
                                )
                            }
                        >
                            🌐 Mở nhóm
                        </PrimaryButton>

                    )}

                </SectionCard>

            )}


            {/* =================================
                ACCOUNT
            ================================= */}

            <SectionCard
                title="👤 Tài khoản Facebook đăng"
            >

                {accounts.length ===
                0 ? (

                    <div>

                        <p>
                            ⚠️ Chưa có tài khoản
                            Facebook nào.
                        </p>


                        <PrimaryButton
                            onClick={() =>
                                navigate(
                                    "/facebook/accounts"
                                )
                            }
                        >
                            👤 Quản lý tài khoản Facebook
                        </PrimaryButton>

                    </div>

                ) : !group ? (

                    <p>
                        ⚠️ Chưa chọn hội nhóm.
                    </p>

                ) : allowedAccounts.length ===
                  0 ? (

                    <div
                        style={{
                            padding:
                                "14px",

                            background:
                                "#fff3cd",

                            border:
                                "1px solid #ffe69c",

                            borderRadius:
                                "8px",
                        }}
                    >

                        <p
                            style={{
                                marginTop:
                                    0,

                                fontWeight:
                                    "600",
                            }}
                        >
                            🚫 Không có tài khoản
                            Facebook nào được
                            phép đăng vào nhóm này.
                        </p>


                        <p
                            style={{
                                marginBottom:
                                    0,

                                color:
                                    "#666",
                            }}
                        >

                            Hãy vào Facebook
                            Accounts → Quản lý nhóm
                            để cấp quyền cho tài
                            khoản.

                        </p>

                    </div>

                ) : (

                    <div
                        style={{
                            maxWidth:
                                "700px",
                        }}
                    >

                        <label
                            style={{
                                display:
                                    "block",

                                fontWeight:
                                    "600",

                                marginBottom:
                                    "8px",
                            }}
                        >

                            Chọn tài khoản sẽ dùng
                            để đăng:

                        </label>


                        <select
                            value={
                                selectedAccountId
                            }

                            onChange={(e) =>
                                setSelectedAccountId(
                                    e.target.value
                                )
                            }

                            disabled={
                                editMode
                            }

                            style={{
                                width:
                                    "100%",

                                padding:
                                    "12px",

                                border:
                                    "1px solid #ccc",

                                borderRadius:
                                    "8px",

                                fontSize:
                                    "16px",

                                boxSizing:
                                    "border-box",

                                background:
                                    editMode
                                        ? "#f5f5f5"
                                        : "#fff",
                            }}
                        >

                            <option value="">
                                -- Chọn tài khoản Facebook --
                            </option>


                            {allowedAccounts.map(
                                (
                                    account
                                ) => (

                                    <option
                                        key={
                                            account.id
                                        }

                                        value={
                                            account.id
                                        }
                                    >

                                        {
                                            account.name
                                        }

                                        {account.isDefault
                                            ? " ⭐ Mặc định"
                                            : ""}

                                    </option>

                                )
                            )}

                        </select>


                        {editMode && (

                            <div
                                style={{
                                    marginTop:
                                        "8px",

                                    fontSize:
                                        "13px",

                                    color:
                                        "#666",
                                }}
                            >

                                🔒 Tài khoản của Job
                                cũ được giữ nguyên.

                            </div>

                        )}


                        {selectedAccountId && (

                            <div
                                style={{
                                    marginTop:
                                        "12px",

                                    padding:
                                        "12px",

                                    background:
                                        "#f5f5f5",

                                    borderRadius:
                                        "8px",
                                }}
                            >

                                <div>

                                    👤{" "}

                                    <strong>

                                        {
                                            selectedAccount?.name ||
                                            "Không rõ"
                                        }

                                    </strong>

                                </div>


                                <div>

                                    🟢 Trạng thái:{" "}

                                    {
                                        selectedAccount?.status ||
                                        "Không rõ"
                                    }

                                </div>


                                <div>

                                    👥 Quyền nhóm:{" "}

                                    {
                                        selectedAccount?.allowAllGroups !==
                                        false

                                            ? selectedAccount
                                                  ?.excludedGroupIds
                                                  ?.length > 0

                                                ? "Tất cả nhóm, trừ một số nhóm"

                                                : "Tất cả các nhóm"

                                            : "Chỉ nhóm được chọn"
                                    }

                                </div>


                                {selectedAccount?.note && (

                                    <div>

                                        📝 Ghi chú:{" "}

                                        {
                                            selectedAccount.note
                                        }

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                )}

            </SectionCard>


            {/* =================================
                ẢNH XE
            ================================= */}

            <SectionCard
                title="📷 Ảnh xe"
            >

                {images.length ===
                0 ? (

                    <p>
                        ⚠️ Xe này chưa có ảnh.
                    </p>

                ) : (

                    <div
                        style={{
                            display:
                                "grid",

                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(150px, 1fr))",

                            gap:
                                "12px",
                        }}
                    >

                        {images.map(
                            (
                                image,
                                index
                            ) => {

                                const src =
                                    getImageSrc(
                                        image
                                    );


                                return (

                                    <div
                                        key={
                                            index
                                        }

                                        style={{
                                            border:
                                                "1px solid #ddd",

                                            borderRadius:
                                                "10px",

                                            overflow:
                                                "hidden",

                                            background:
                                                "#fff",
                                        }}
                                    >

                                        <img
                                            src={
                                                src
                                            }

                                            alt={`Ảnh xe ${
                                                index +
                                                1
                                            }`}

                                            style={{
                                                width:
                                                    "100%",

                                                height:
                                                    "150px",

                                                objectFit:
                                                    "cover",

                                                display:
                                                    "block",
                                            }}
                                        />

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </SectionCard>


            {/* =================================
                FACEBOOK CONTENT
            ================================= */}

            <SectionCard
                title={
                    editMode
                        ? "📝 Chỉnh sửa nội dung Facebook"
                        : "📝 Nội dung Facebook"
                }
            >

                <div
                    style={{
                        display:
                            "flex",

                        gap:
                            "10px",

                        flexWrap:
                            "wrap",

                        marginBottom:
                            "12px",
                    }}
                >

                    <PrimaryButton
                        onClick={
                            handleGenerateAI
                        }

                        disabled={
                            generatingAI
                        }
                    >

                        {generatingAI

                            ? "⏳ AI đang viết..."

                            : content.trim()

                                ? "🔄 TẠO LẠI BẰNG AI"

                                : "🤖 TẠO NỘI DUNG BẰNG AI"}

                    </PrimaryButton>


                    {content.trim() && (

                        <PrimaryButton
                            onClick={() =>
                                setContent("")
                            }

                            disabled={
                                generatingAI ||
                                savingEdit
                            }

                            style={{
                                background:
                                    "#777",
                            }}
                        >

                            🗑️ Xóa nội dung

                        </PrimaryButton>

                    )}

                </div>


                {!content.trim() && (

                    <div
                        style={{
                            marginBottom:
                                "12px",

                            padding:
                                "12px",

                            background:
                                "#fff8e1",

                            border:
                                "1px solid #ffe082",

                            borderRadius:
                                "8px",
                        }}
                    >

                        💡 Xe này chưa có nội
                        dung Facebook. Ông có thể
                        bấm{" "}

                        <strong>
                            "Tạo nội dung bằng AI"
                        </strong>{" "}

                        hoặc tự nhập nội dung bên
                        dưới.

                    </div>

                )}


                {editMode && (

                    <div
                        style={{
                            marginBottom:
                                "12px",

                            padding:
                                "12px",

                            background:
                                "#f3e5f5",

                            border:
                                "1px solid #ce93d8",

                            borderRadius:
                                "8px",

                            color:
                                "#6a1b9a",
                        }}
                    >

                        ✏️ Đây là nội dung đang
                        được lưu trong Job cũ.

                        <br />

                        Ông chỉnh sửa trực tiếp
                        bên dưới rồi bấm
                        <strong>
                            {" "}
                            "LƯU NỘI DUNG & QUAY LẠI QUEUE"
                        </strong>.

                    </div>

                )}


                <textarea

                    value={
                        content
                    }

                    onChange={(e) =>
                        setContent(
                            e.target.value
                        )
                    }

                    placeholder="Nội dung Facebook sẽ xuất hiện ở đây..."

                    style={{
                        width:
                            "100%",

                        minHeight:
                            "300px",

                        padding:
                            "15px",

                        fontSize:
                            "16px",

                        lineHeight:
                            "1.6",

                        boxSizing:
                            "border-box",

                        borderRadius:
                            "10px",

                        border:
                            content.trim()
                                ? "1px solid #ccc"
                                : "1px solid #ffcc80",

                        resize:
                            "vertical",
                    }}

                />


                <div
                    style={{
                        marginTop:
                            "8px",

                        color:
                            "#777",

                        fontSize:
                            "13px",
                    }}
                >

                    📝 {content.length} ký tự

                </div>

            </SectionCard>


            {/* =================================
                READY
            ================================= */}

            <SectionCard
                title={
                    editMode
                        ? "💾 Lưu thay đổi"
                        : "🚀 Sẵn sàng đăng"
                }
            >

                <div>


                    <div
                        style={{
                            marginBottom:
                                "10px",
                        }}
                    >

                        👤 Tài khoản:{" "}

                        <strong>

                            {
                                selectedAccount?.name ||
                                "Chưa chọn tài khoản"
                            }

                        </strong>

                    </div>


                    <div
                        style={{
                            marginBottom:
                                "10px",
                        }}
                    >

                        👥 Nhóm:{" "}

                        <strong>

                            {
                                group?.name ||
                                "Chưa chọn nhóm"
                            }

                        </strong>

                    </div>


                    <div
                        style={{
                            marginBottom:
                                "10px",
                        }}
                    >

                        📷 Số ảnh:{" "}

                        <strong>

                            {
                                images.length
                            }

                        </strong>

                    </div>


                    <div
                        style={{
                            marginBottom:
                                "10px",
                        }}
                    >

                        📝 Nội dung:{" "}

                        <strong>

                            {content.trim()
                                ? "Đã có"
                                : "Chưa có"}

                        </strong>

                    </div>


                    {editMode && editJob && (

                        <div
                            style={{
                                marginTop:
                                    "14px",

                                marginBottom:
                                    "14px",

                                padding:
                                    "12px",

                                background:
                                    "#f5f5f5",

                                borderRadius:
                                    "8px",

                                fontSize:
                                    "14px",
                            }}
                        >

                            <div>

                                🆔 Job ID:{" "}

                                <strong>
                                    {
                                        editJob.id
                                    }
                                </strong>

                            </div>


                            <div>

                                📌 Trạng thái hiện tại:{" "}

                                <strong>
                                    {
                                        editJob.status
                                    }
                                </strong>

                            </div>


                            {editJob.error && (

                                <div
                                    style={{
                                        marginTop:
                                            "6px",

                                        color:
                                            "#c62828",
                                    }}
                                >

                                    🔴 Lỗi cũ:{" "}

                                    {
                                        editJob.error
                                    }

                                </div>

                            )}

                        </div>

                    )}


                    <br />


                    {editMode ? (

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
                                    handleSaveEdit
                                }

                                disabled={
                                    savingEdit ||
                                    generatingAI ||
                                    !content.trim()
                                }
                            >

                                {savingEdit
                                    ? "⏳ Đang lưu..."
                                    : "💾 LƯU NỘI DUNG & QUAY LẠI QUEUE"}

                            </PrimaryButton>


                            <PrimaryButton
                                onClick={
                                    handleCancelEdit
                                }

                                disabled={
                                    savingEdit
                                }

                                style={{
                                    background:
                                        "#777",
                                }}
                            >

                                ↩️ Hủy sửa

                            </PrimaryButton>

                        </div>

                    ) : (

                        <PrimaryButton
                            onClick={
                                handleAddToQueue
                            }

                            disabled={
                                addingToQueue ||
                                !group ||
                                allowedAccounts.length ===
                                    0 ||
                                !selectedAccountId ||
                                images.length ===
                                    0 ||
                                !content.trim()
                            }
                        >

                            {addingToQueue

                                ? "⏳ Đang thêm vào Queue..."

                                : "➕ THÊM VÀO QUEUE"}

                        </PrimaryButton>

                    )}


                    <div
                        style={{
                            marginTop:
                                "12px",

                            color:
                                "#666",

                            fontSize:
                                "14px",
                        }}
                    >

                        {editMode ? (

                            <>
                                💡 Sau khi lưu,
                                Job cũ sẽ trở lại
                                trạng thái{" "}
                                <strong>
                                    CHỜ XỬ LÝ
                                </strong>{" "}
                                và ông sẽ được đưa
                                về đúng Job trong
                                Facebook Queue.
                            </>

                        ) : (

                            <>
                                💡 Bài đăng sẽ được đưa
                                vào hàng đợi. Hiện tại
                                vẫn là Simulation, chưa
                                đăng Facebook thật.
                            </>

                        )}

                    </div>

                </div>

            </SectionCard>

        </main>

    );

}


export default FacebookPostPreview;