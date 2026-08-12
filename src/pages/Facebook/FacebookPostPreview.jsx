import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionCard from "../../components/Common/SectionCard";
import PrimaryButton from "../../components/Common/PrimaryButton";

import {
    getCurrentPosting,
} from "../../services/postingSessionService";

import {
    addToPostingQueue,
} from "../../services/facebookPostingQueueService";

import {
    loadAccounts,
    getDefaultAccount,
} from "../../services/facebookAccountService";

import {
    loadGroups,
} from "../../services/facebookGroupService";

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

    const [groups, setGroups] =
        useState([]);

    const [selectedGroupIds, setSelectedGroupIds] =
        useState([]);

    const [groupSearch, setGroupSearch] =
        useState("");

    const [content, setContent] =
        useState("");

    const [addingToQueue, setAddingToQueue] =
        useState(false);

    const [generatingAI, setGeneratingAI] =
        useState(false);

    const [accounts, setAccounts] =
        useState([]);

    const [selectedAccountId, setSelectedAccountId] =
        useState("");


    // ==========================================
    // LOAD DỮ LIỆU
    // ==========================================

    useEffect(() => {

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
        // LOAD FACEBOOK GROUPS
        // --------------------------------------

        const savedGroups =
            loadGroups();

        setGroups(
            savedGroups
        );


        // --------------------------------------
        // LOAD NHÓM ĐÃ CHỌN TỪ BƯỚC TRƯỚC
        // --------------------------------------

        const savedGroup =
            sessionStorage.getItem(
                "toyota_sure_selected_group"
            );


        if (savedGroup) {

            try {

                const parsedGroup =
                    JSON.parse(
                        savedGroup
                    );

                if (parsedGroup?.id) {

                    setSelectedGroupIds([
                        String(
                            parsedGroup.id
                        ),
                    ]);
                }

            } catch (error) {

                console.error(
                    "Không đọc được nhóm Facebook:",
                    error
                );
            }
        }


        // --------------------------------------
        // LOAD AI CONTENT CŨ
        // --------------------------------------

        if (
            car?.aiContent?.facebook
        ) {

            setContent(
                car.aiContent.facebook
            );
        }

    }, []);


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
    // ACCOUNT ĐANG CHỌN
    // ==========================================

    const selectedAccount =
        accounts.find(
            (account) =>
                String(
                    account.id
                ) ===
                String(
                    selectedAccountId
                )
        );


    // ==========================================
    // NHÓM ĐƯỢC PHÉP ĐĂNG
    // ==========================================

    const allowedGroups =
        useMemo(() => {

            if (!selectedAccount) {
                return [];
            }

            return groups.filter(
                (group) =>
                    isAccountAllowedForGroup(
                        selectedAccount,
                        group
                    )
            );

        }, [
            groups,
            selectedAccount,
        ]);


    // ==========================================
    // NHÓM SAU KHI TÌM KIẾM
    // ==========================================

    const filteredGroups =
        useMemo(() => {

            const keyword =
                groupSearch
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return allowedGroups;
            }

            return allowedGroups.filter(
                (group) => {

                    const nameMatch =
                        group.name
                            ?.toLowerCase()
                            .includes(
                                keyword
                            );

                    const urlMatch =
                        group.url
                            ?.toLowerCase()
                            .includes(
                                keyword
                            );

                    const suitableMatch =
                        Array.isArray(
                            group.suitableCars
                        ) &&
                        group.suitableCars.some(
                            (car) =>
                                car
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )
                        );

                    return (
                        nameMatch ||
                        urlMatch ||
                        suitableMatch
                    );
                }
            );

        }, [
            allowedGroups,
            groupSearch,
        ]);


    // ==========================================
    // NHÓM ĐÃ CHỌN
    // ==========================================

    const selectedGroups =
        allowedGroups.filter(
            (group) =>
                selectedGroupIds.some(
                    (id) =>
                        String(id) ===
                        String(group.id)
                )
        );


    // ==========================================
    // TỰ LOẠI NHÓM KHÔNG CÒN HỢP LỆ
    // KHI ĐỔI FACEBOOK ACCOUNT
    // ==========================================

    useEffect(() => {

        setSelectedGroupIds(
            (currentIds) =>
                currentIds.filter(
                    (id) =>
                        allowedGroups.some(
                            (group) =>
                                String(
                                    group.id
                                ) ===
                                String(id)
                        )
                )
        );

    }, [
        selectedAccountId,
        allowedGroups,
    ]);


    // ==========================================
    // CHỌN / BỎ CHỌN 1 NHÓM
    // ==========================================

    function toggleGroup(
        groupId
    ) {

        const id =
            String(
                groupId
            );

        setSelectedGroupIds(
            (currentIds) => {

                const exists =
                    currentIds.some(
                        (item) =>
                            String(
                                item
                            ) ===
                            id
                    );

                if (exists) {

                    return currentIds.filter(
                        (item) =>
                            String(
                                item
                            ) !==
                            id
                    );
                }

                return [
                    ...currentIds,
                    id,
                ];
            }
        );
    }


    // ==========================================
    // CHỌN TẤT CẢ NHÓM ĐANG HIỂN THỊ
    // ==========================================

    function handleSelectAllVisibleGroups() {

        const visibleIds =
            filteredGroups.map(
                (group) =>
                    String(
                        group.id
                    )
            );

        if (
            visibleIds.length === 0
        ) {
            return;
        }

        setSelectedGroupIds(
            (currentIds) => {

                const allSelected =
                    visibleIds.every(
                        (id) =>
                            currentIds.some(
                                (item) =>
                                    String(
                                        item
                                    ) ===
                                    id
                            )
                    );

                if (allSelected) {

                    return currentIds.filter(
                        (id) =>
                            !visibleIds.includes(
                                String(id)
                            )
                    );
                }

                return Array.from(
                    new Set([
                        ...currentIds.map(
                            (id) =>
                                String(id)
                        ),
                        ...visibleIds,
                    ])
                );
            }
        );
    }


    // ==========================================
    // CHỌN TẤT CẢ NHÓM ĐƯỢC PHÉP
    // ==========================================

    function handleSelectAllAllowedGroups() {

        if (
            allowedGroups.length === 0
        ) {
            return;
        }

        setSelectedGroupIds(
            allowedGroups.map(
                (group) =>
                    String(
                        group.id
                    )
            )
        );
    }


    // ==========================================
    // BỎ CHỌN TẤT CẢ
    // ==========================================

    function handleClearSelectedGroups() {

        setSelectedGroupIds([]);
    }


    // ==========================================
    // CHƯA CÓ XE
    // ==========================================

    if (!postingCar) {

        return (

            <main className="content">

                <h1>
                    🚀 Facebook Posting
                </h1>


                <SectionCard
                    title="⚠️ Chưa có xe"
                >

                    <p>
                        Chưa có chiếc xe nào
                        được chọn để đăng.
                    </p>


                    <PrimaryButton
                        onClick={() =>
                            navigate(
                                "/cars"
                            )
                        }
                    >
                        🚗 Quay lại danh sách xe
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

        if (generatingAI) {
            return;
        }


        if (!postingCar) {

            alert(
                "⚠️ Chưa có xe để tạo nội dung."
            );

            return;
        }


        try {

            setGeneratingAI(
                true
            );


            const result =
                await generateFacebookPost(
                    postingCar
                );


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
    // TẠO NHIỀU JOB VÀO QUEUE
    // ==========================================

    function handleAddBulkToQueue() {

        if (
            !selectedAccount
        ) {

            alert(
                "⚠️ Chưa chọn tài khoản Facebook."
            );

            return;
        }


        if (
            selectedAccount.status !==
            "active"
        ) {

            alert(
                "⚠️ Tài khoản Facebook hiện không hoạt động."
            );

            return;
        }


        if (
            selectedGroups.length ===
            0
        ) {

            alert(
                "⚠️ Chưa chọn nhóm Facebook."
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


        const confirmed =
            window.confirm(
                `🚀 Tạo ${selectedGroups.length} bài đăng vào Queue?\n\n` +
                `🚗 Xe: ${postingCar.brand || ""} ${postingCar.model || ""}\n` +
                `👤 Facebook: ${selectedAccount.name}\n` +
                `👥 Số nhóm: ${selectedGroups.length}\n` +
                `📷 Ảnh: ${images.length}`
            );


        if (!confirmed) {
            return;
        }


        try {

            setAddingToQueue(
                true
            );


            const createdJobs = [];


            for (
                const currentGroup of selectedGroups
            ) {

                const job =
                    addToPostingQueue({

                        carId:
                            postingCar.id,

                        group: {
                            ...currentGroup,

                            matchScore:
                                currentGroup.matchScore ||
                                0,
                        },

                        content,

                        imageCount:
                            images.length,

                        accountId:
                            Number(
                                selectedAccountId
                            ),
                    });


                createdJobs.push(
                    job
                );
            }


            console.log(
                "✅ Bulk Facebook Queue Jobs:",
                createdJobs
            );


            alert(
                "✅ Đã tạo Queue thành công!\n\n" +
                `🚗 Xe: ${postingCar.brand || ""} ${postingCar.model || ""}\n` +
                `👤 Facebook: ${selectedAccount.name}\n` +
                `👥 Đã tạo: ${createdJobs.length} Job\n` +
                `📷 Ảnh mỗi bài: ${images.length}\n\n` +
                "Các bài đang ở trạng thái CHỜ ĐĂNG."
            );


            navigate(
                "/facebook/queue"
            );

        } catch (error) {

            console.error(
                "Lỗi tạo Bulk Queue:",
                error
            );


            alert(
                "❌ Không thể tạo Queue:\n\n" +
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
    // CHECKBOX TRẠNG THÁI
    // ==========================================

    const allVisibleSelected =
        filteredGroups.length > 0 &&
        filteredGroups.every(
            (group) =>
                selectedGroupIds.some(
                    (id) =>
                        String(id) ===
                        String(group.id)
                )
        );


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <main className="content">

            <h1>
                🚀 Facebook Posting
            </h1>


            <p
                style={{
                    color: "#666",
                    marginTop: 0,
                }}
            >
                Chọn một Facebook và nhiều hội nhóm.
                ToyotaSureHub sẽ tự tạo Queue cho từng nhóm.
            </p>


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
                    {postingCar.color
                        ? ` · ${postingCar.color}`
                        : ""}
                </p>

            </SectionCard>


            {/* =================================
                ACCOUNT
            ================================= */}

            <SectionCard
                title="👤 1. Chọn tài khoản Facebook"
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

                ) : (

                    <div
                        style={{
                            maxWidth:
                                "700px",
                        }}
                    >

                        <select
                            value={
                                selectedAccountId
                            }
                            onChange={(e) =>
                                setSelectedAccountId(
                                    e.target.value
                                )
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
                                    "#fff",
                            }}
                        >

                            <option value="">
                                -- Chọn tài khoản Facebook --
                            </option>


                            {accounts.map(
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

                                        {account.status !==
                                        "active"
                                            ? " 🔴 Không hoạt động"
                                            : ""}

                                    </option>

                                )
                            )}

                        </select>


                        {selectedAccount && (

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
                                            selectedAccount.name
                                        }
                                    </strong>
                                </div>


                                <div>
                                    🟢 Trạng thái:{" "}
                                    {
                                        selectedAccount.status
                                    }
                                </div>


                                <div>
                                    👥 Quyền nhóm:{" "}

                                    {selectedAccount.allowAllGroups !==
                                    false
                                        ? selectedAccount.excludedGroupIds?.length >
                                          0
                                            ? "Tất cả nhóm, trừ một số nhóm"
                                            : "Tất cả các nhóm"
                                        : "Chỉ nhóm được chọn"}
                                </div>


                                <div
                                    style={{
                                        marginTop:
                                            "6px",
                                        fontWeight:
                                            "600",
                                    }}
                                >
                                    📊 Được phép đăng:
                                    {" "}
                                    {
                                        allowedGroups.length
                                    }
                                    {" "}
                                    nhóm
                                </div>

                            </div>

                        )}

                    </div>

                )}

            </SectionCard>


            {/* =================================
                GROUP SELECTOR
            ================================= */}

            <SectionCard
                title="👥 2. Chọn các nhóm muốn đăng"
            >

                {!selectedAccount ? (

                    <p>
                        ⚠️ Hãy chọn tài khoản Facebook
                        trước.
                    </p>

                ) : allowedGroups.length ===
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

                        <strong>
                            🚫 Tài khoản này chưa được
                            phép đăng vào nhóm nào.
                        </strong>

                        <p
                            style={{
                                marginBottom:
                                    0,
                                color:
                                    "#666",
                            }}
                        >
                            Vào Facebook Accounts để
                            thiết lập quyền nhóm.
                        </p>

                    </div>

                ) : (

                    <>

                        {/* SEARCH + ACTIONS */}

                        <div
                            style={{
                                display:
                                    "flex",

                                gap:
                                    "10px",

                                flexWrap:
                                    "wrap",

                                marginBottom:
                                    "14px",
                            }}
                        >

                            <input
                                type="text"
                                value={
                                    groupSearch
                                }
                                onChange={(e) =>
                                    setGroupSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="🔍 Tìm tên nhóm..."
                                style={{
                                    flex:
                                        "1 1 300px",

                                    padding:
                                        "11px",

                                    border:
                                        "1px solid #ccc",

                                    borderRadius:
                                        "8px",

                                    fontSize:
                                        "15px",

                                    boxSizing:
                                        "border-box",
                                }}
                            />


                            <PrimaryButton
                                onClick={
                                    handleSelectAllAllowedGroups
                                }
                            >
                                ☑ Chọn tất cả
                            </PrimaryButton>


                            <PrimaryButton
                                onClick={
                                    handleClearSelectedGroups
                                }
                                style={{
                                    background:
                                        "#777",
                                }}
                            >
                                ⬜ Bỏ chọn
                            </PrimaryButton>

                        </div>


                        {/* SUMMARY */}

                        <div
                            style={{
                                marginBottom:
                                    "12px",

                                padding:
                                    "12px",

                                background:
                                    "#f5f5f5",

                                borderRadius:
                                    "8px",
                            }}
                        >

                            <strong>
                                👥 Đã chọn:{" "}
                                {
                                    selectedGroups.length
                                }
                                {" / "}
                                {
                                    allowedGroups.length
                                }
                                {" "}
                                nhóm
                            </strong>


                            {groupSearch && (
                                <span
                                    style={{
                                        marginLeft:
                                            "12px",
                                        color:
                                            "#666",
                                    }}
                                >
                                    🔍 Hiển thị{" "}
                                    {
                                        filteredGroups.length
                                    }
                                    {" "}
                                    nhóm
                                </span>
                            )}

                        </div>


                        {/* SELECT VISIBLE */}

                        {filteredGroups.length >
                            0 && (

                            <PrimaryButton
                                onClick={
                                    handleSelectAllVisibleGroups
                                }
                                style={{
                                    marginBottom:
                                        "14px",
                                    background:
                                        allVisibleSelected
                                            ? "#777"
                                            : "#1976d2",
                                }}
                            >
                                {allVisibleSelected
                                    ? "⬜ Bỏ chọn nhóm đang hiển thị"
                                    : "☑ Chọn tất cả nhóm đang hiển thị"}
                            </PrimaryButton>

                        )}


                        {/* GROUP LIST */}

                        <div
                            style={{
                                display:
                                    "grid",

                                gap:
                                    "10px",

                                maxHeight:
                                    "500px",

                                overflowY:
                                    "auto",

                                paddingRight:
                                    "4px",
                            }}
                        >

                            {filteredGroups.length ===
                            0 ? (

                                <p
                                    style={{
                                        color:
                                            "#777",
                                    }}
                                >
                                    🔍 Không tìm thấy
                                    nhóm phù hợp.
                                </p>

                            ) : (

                                filteredGroups.map(
                                    (
                                        currentGroup
                                    ) => {

                                        const isSelected =
                                            selectedGroupIds.some(
                                                (
                                                    id
                                                ) =>
                                                    String(
                                                        id
                                                    ) ===
                                                    String(
                                                        currentGroup.id
                                                    )
                                            );


                                        return (

                                            <label
                                                key={
                                                    currentGroup.id
                                                }
                                                style={{
                                                    display:
                                                        "flex",

                                                    alignItems:
                                                        "center",

                                                    gap:
                                                        "12px",

                                                    padding:
                                                        "12px",

                                                    border:
                                                        isSelected
                                                            ? "2px solid #1976d2"
                                                            : "1px solid #ddd",

                                                    borderRadius:
                                                        "10px",

                                                    background:
                                                        isSelected
                                                            ? "#eaf3ff"
                                                            : "#fff",

                                                    cursor:
                                                        "pointer",
                                                }}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        isSelected
                                                    }
                                                    onChange={() =>
                                                        toggleGroup(
                                                            currentGroup.id
                                                        )
                                                    }
                                                    style={{
                                                        width:
                                                            "20px",

                                                        height:
                                                            "20px",

                                                        flexShrink:
                                                            0,
                                                    }}
                                                />


                                                <div
                                                    style={{
                                                        flex:
                                                            1,
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                "600",
                                                        }}
                                                    >
                                                        👥{" "}
                                                        {
                                                            currentGroup.name
                                                        }
                                                    </div>


                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "4px",

                                                            fontSize:
                                                                "13px",

                                                            color:
                                                                "#777",
                                                        }}
                                                    >

                                                        📌 Đã đăng:{" "}
                                                        {
                                                            currentGroup.totalPosts ||
                                                            0
                                                        }

                                                        {" · "}

                                                        🟢{" "}
                                                        {
                                                            currentGroup.status ||
                                                            "active"
                                                        }

                                                    </div>

                                                </div>

                                            </label>

                                        );
                                    }
                                )

                            )}

                        </div>

                    </>
                )}

            </SectionCard>


            {/* =================================
                ẢNH XE
            ================================= */}

            <SectionCard
                title="📷 3. Ảnh xe"
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
                title="📝 4. Nội dung Facebook"
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
                                generatingAI
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

                        💡 Xe này chưa có nội dung
                        Facebook. Ông có thể bấm{" "}
                        <strong>
                            "Tạo nội dung bằng AI"
                        </strong>
                        {" "}hoặc tự nhập nội dung.

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
                BULK READY / ACTION
            ================================= */}

            <SectionCard
                title="🚀 5. Sẵn sàng tạo Queue"
            >

                <div>

                    <div
                        style={{
                            marginBottom:
                                "10px",
                        }}
                    >
                        👤 Facebook:{" "}

                        <strong>
                            {
                                selectedAccount?.name ||
                                "Chưa chọn"
                            }
                        </strong>
                    </div>


                    <div
                        style={{
                            marginBottom:
                                "10px",
                        }}
                    >
                        👥 Số nhóm:{" "}

                        <strong>
                            {
                                selectedGroups.length
                            }
                        </strong>
                    </div>


                    <div
                        style={{
                            marginBottom:
                                "10px",
                        }}
                    >
                        📷 Số ảnh mỗi bài:{" "}

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


                    <br />


                    <PrimaryButton
                        onClick={
                            handleAddBulkToQueue
                        }
                        disabled={
                            addingToQueue ||
                            !selectedAccount ||
                            selectedGroups.length ===
                                0 ||
                            images.length ===
                                0 ||
                            !content.trim()
                        }
                    >
                        {addingToQueue
                            ? "⏳ Đang tạo Queue..."
                            : `➕ TẠO QUEUE CHO ${selectedGroups.length} NHÓM`}
                    </PrimaryButton>


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

                        💡 Mỗi nhóm sẽ trở thành một
                        Job riêng trong Queue. Sau đó
                        Queue Worker sẽ xử lý tuần tự,
                        không đăng đồng thời tất cả
                        các nhóm.

                    </div>

                </div>

            </SectionCard>

        </main>
    );
}


export default FacebookPostPreview;