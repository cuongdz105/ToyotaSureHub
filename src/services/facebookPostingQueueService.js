const QUEUE_KEY = "facebook_posting_queue";

const ACCOUNTS_KEY = "toyota_fb_accounts";


// ==========================================
// CREATE QUEUE ID
// ==========================================

function createId() {
    return `queue_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}


// ==========================================
// LOAD ACCOUNTS
// ==========================================

function loadAccounts() {
    const data =
        localStorage.getItem(
            ACCOUNTS_KEY
        );

    if (!data) {
        return [];
    }

    try {
        const accounts =
            JSON.parse(data);

        return Array.isArray(accounts)
            ? accounts
            : [];

    } catch (error) {

        console.error(
            "Không đọc được Facebook Accounts:",
            error
        );

        return [];
    }
}


// ==========================================
// KIỂM TRA ACCOUNT CÓ QUYỀN GROUP
// ==========================================

function isAccountAllowedForGroup(
    account,
    group
) {

    if (
        !account ||
        !group
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
        String(group.id);


    // ======================================
    // MODE 1:
    // CHO PHÉP TẤT CẢ NHÓM
    // ======================================

    if (
        account.allowAllGroups === true
    ) {

        const excludedGroupIds =
            Array.isArray(
                account.excludedGroupIds
            )
                ? account.excludedGroupIds
                : [];


        const isExcluded =
            excludedGroupIds.some(
                (id) =>
                    String(id) ===
                    groupId
            );


        return !isExcluded;
    }


    // ======================================
    // MODE 2:
    // CHỈ NHÓM ĐƯỢC CHỌN
    // ======================================

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
// VALIDATE ACCOUNT POSTING PERMISSION
// ==========================================

function validateAccountPermission(
    accountId,
    group
) {

    if (!accountId) {

        throw new Error(
            "Chưa chọn tài khoản Facebook."
        );
    }


    if (!group) {

        throw new Error(
            "Chưa chọn hội nhóm."
        );
    }


    const accounts =
        loadAccounts();


    const account =
        accounts.find(
            (item) =>
                String(item.id) ===
                String(accountId)
        );


    if (!account) {

        throw new Error(
            `Không tìm thấy tài khoản Facebook với ID: ${accountId}`
        );
    }


    if (
        account.status !==
        "active"
    ) {

        throw new Error(
            `Tài khoản Facebook "${account.name}" hiện không hoạt động.`
        );
    }


    const allowed =
        isAccountAllowedForGroup(
            account,
            group
        );


    if (!allowed) {

        throw new Error(
            `Tài khoản "${account.name}" không được phép đăng vào nhóm "${group.name}".`
        );
    }


    return account;
}


// ==========================================
// LOAD QUEUE
// ==========================================

export function loadPostingQueue() {

    const data =
        localStorage.getItem(
            QUEUE_KEY
        );


    if (!data) {
        return [];
    }


    try {

        const queue =
            JSON.parse(data);


        return Array.isArray(queue)
            ? queue
            : [];


    } catch (error) {

        console.error(
            "Không đọc được Facebook Posting Queue:",
            error
        );


        return [];
    }
}


// ==========================================
// SAVE QUEUE
// ==========================================

export function savePostingQueue(
    queue
) {

    localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify(queue)
    );
}


// ==========================================
// ADD TO QUEUE
// ==========================================

export function addToPostingQueue({
    campaignId = null,
    carId,
    group,
    content,
    imageCount = 0,
    accountId = null,
    variation = null,
}) {

    // ======================================
    // BASIC VALIDATION
    // ======================================

    if (!group) {

        throw new Error(
            "Chưa chọn hội nhóm."
        );
    }


    if (!content?.trim()) {

        throw new Error(
            "Nội dung Facebook đang trống."
        );
    }


    if (
        !imageCount ||
        imageCount <= 0
    ) {

        throw new Error(
            "Bài đăng chưa có ảnh."
        );
    }


    // ======================================
    // ACCOUNT PERMISSION CHECK
    // ======================================

    const account =
        validateAccountPermission(
            accountId,
            group
        );


    // ======================================
    // LOAD QUEUE
    // ======================================

    const queue =
        loadPostingQueue();


    // ======================================
    // CREATE JOB
    // ======================================

    const now =
        new Date().toISOString();


    const job = {

        id: createId(),


        logs: [

            {
                message:
                    "📋 Bài đăng được thêm vào Queue",

                timestamp:
                    now,
            },

            {
                message:
                    `👤 Tài khoản: ${account.name}`,

                timestamp:
                    now,
            },

            {
                message:
                    `👥 Nhóm: ${group.name}`,

                timestamp:
                    now,
            },

        ],


        // --------------------------------------
        // CAMPAIGN
        // --------------------------------------

        // Job cũ không có campaignId vẫn chạy bình thường.
        // Campaign mới sẽ truyền ID vào đây.

        campaignId:
            campaignId
                ? String(campaignId)
                : null,


        carId:
            carId || null,


        accountId:
            Number(account.id),


        account: {

            id:
                account.id,

            name:
                account.name,

            status:
                account.status,

        },


        group: {

            id:
                group.id,

            name:
                group.name,

            url:
                group.url || "",

            matchScore:
                group.matchScore || 0,

        },


        content:
            content.trim(),


        imageCount:
            Number(imageCount),


        variation:
            variation
                ? {

                    contentVariant:
                        Number(
                            variation.contentVariant ||
                            1
                        ),

                    imageIndexes:
                        Array.isArray(
                            variation.imageIndexes
                        )
                            ? variation.imageIndexes
                            : [],

                    imageCount:
                        Number(
                            variation.imageCount ||
                            imageCount
                        ),

                }
                : null,


        status:
            "waiting",


        error:
            null,


        result:
            null,


        createdAt:
            now,


        updatedAt:
            now,

    };


    // ======================================
    // SAVE
    // ======================================

    const updatedQueue = [

        ...queue,

        job,

    ];


    savePostingQueue(
        updatedQueue
    );


    console.log(
        "✅ Queue Job Created:",
        job
    );


    return job;
}


// ==========================================
// UPDATE QUEUE JOB
// ==========================================

export function updateQueueJob(
    jobId,
    updates = {}
) {

    const queue =
        loadPostingQueue();


    const updatedQueue =
        queue.map((job) => {

            if (
                job.id !==
                jobId
            ) {

                return job;
            }


            return {

                ...job,

                ...updates,

                updatedAt:
                    new Date().toISOString(),

            };

        });


    savePostingQueue(
        updatedQueue
    );


    return updatedQueue.find(
        (job) =>
            job.id ===
            jobId
    );
}


// ==========================================
// ADD QUEUE LOG
// ==========================================


// ==========================================
// MANUAL FACEBOOK FLOW
// ==========================================
//
// Manual Flow KHÔNG gọi Posting Engine.
//
// WAITING
//   ↓ chuẩn bị
// MANUAL_READY
//   ↓ người dùng xác nhận đã bấm Đăng trên Facebook
// SUCCESS
//
// Tuyệt đối không tự đánh dấu SUCCESS khi chỉ mở Group.
// ==========================================

export function prepareManualPostingJob(jobId) {

    const queue =
        loadPostingQueue();


    const job =
        queue.find(
            (item) =>
                item.id ===
                jobId
        );


    if (!job) {

        throw new Error(
            "Không tìm thấy bài đăng trong Queue."
        );
    }


    if (
        job.status !==
        "waiting"
    ) {

        throw new Error(
            `Job hiện đang ở trạng thái "${job.status}".`
        );
    }


    const now =
        new Date().toISOString();


    const updatedQueue =
        queue.map((item) => {

            if (
                item.id !==
                jobId
            ) {

                return item;
            }


            return {

                ...item,

                status:
                    "manual_ready",


                error:
                    null,


                result: {

                    mode:
                        "manual",

                    published:
                        false,

                    confirmedByUser:
                        false,

                    preparedAt:
                        now,

                },


                logs: [

                    ...(Array.isArray(item.logs)
                        ? item.logs
                        : []),

                    {

                        message:
                            "🟠 Đã chuẩn bị bài — chờ ông đăng trên Facebook",

                        timestamp:
                            now,

                    },

                ],


                updatedAt:
                    now,

            };

        });


    savePostingQueue(
        updatedQueue
    );


    return updatedQueue.find(
        (item) =>
            item.id ===
            jobId
    );
}


// ==========================================
// CONFIRM MANUAL POSTED
// ==========================================

export function confirmManualPosted(
    jobId
) {

    const queue =
        loadPostingQueue();


    const job =
        queue.find(
            (item) =>
                item.id ===
                jobId
        );


    if (!job) {

        throw new Error(
            "Không tìm thấy bài đăng trong Queue."
        );
    }


    if (
        job.status !==
        "manual_ready"
    ) {

        throw new Error(
            "Job chưa ở trạng thái chờ xác nhận đăng Facebook."
        );
    }


    const now =
        new Date().toISOString();


    const updatedQueue =
        queue.map((item) => {

            if (
                item.id !==
                jobId
            ) {

                return item;
            }


            return {

                ...item,

                status:
                    "success",


                error:
                    null,


                result: {

                    ...(item.result || {}),

                    mode:
                        "manual",

                    published:
                        true,

                    confirmedByUser:
                        true,

                    confirmedAt:
                        now,

                },


                logs: [

                    ...(Array.isArray(item.logs)
                        ? item.logs
                        : []),

                    {

                        message:
                            "🟢 Ông đã xác nhận bài đăng Facebook thành công",

                        timestamp:
                            now,

                    },

                ],


                updatedAt:
                    now,

            };

        });


    savePostingQueue(
        updatedQueue
    );


    return updatedQueue.find(
        (item) =>
            item.id ===
            jobId
    );
}


// ==========================================
// CANCEL MANUAL POSTING JOB
// ==========================================

export function cancelManualPostingJob(
    jobId
) {

    const queue =
        loadPostingQueue();


    const job =
        queue.find(
            (item) =>
                item.id ===
                jobId
        );


    if (!job) {

        throw new Error(
            "Không tìm thấy bài đăng trong Queue."
        );
    }


    if (
        job.status !==
        "manual_ready"
    ) {

        throw new Error(
            "Job không ở trạng thái Manual Ready."
        );
    }


    const now =
        new Date().toISOString();


    const updatedQueue =
        queue.map((item) => {

            if (
                item.id !==
                jobId
            ) {

                return item;
            }


            return {

                ...item,

                status:
                    "waiting",


                result:
                    null,


                logs: [

                    ...(Array.isArray(item.logs)
                        ? item.logs
                        : []),

                    {

                        message:
                            "↩️ Đưa Job về CHỜ ĐĂNG",

                        timestamp:
                            now,

                    },

                ],


                updatedAt:
                    now,

            };

        });


    savePostingQueue(
        updatedQueue
    );


    return updatedQueue.find(
        (item) =>
            item.id ===
            jobId
    );
}


// ==========================================
// ADD QUEUE LOG
// ==========================================

export function addQueueLog(
    jobId,
    message
) {

    const queue =
        loadPostingQueue();


    const updatedQueue =
        queue.map((job) => {

            if (
                job.id !==
                jobId
            ) {

                return job;
            }


            const logs =
                Array.isArray(
                    job.logs
                )
                    ? job.logs
                    : [];


            return {

                ...job,

                logs: [

                    ...logs,

                    {

                        message,

                        timestamp:
                            new Date().toISOString(),

                    },

                ],


                updatedAt:
                    new Date().toISOString(),

            };

        });


    savePostingQueue(
        updatedQueue
    );


    return updatedQueue.find(
        (job) =>
            job.id ===
            jobId
    );
}


// ==========================================
// REMOVE QUEUE JOB
// ==========================================

export function removeQueueJob(
    jobId
) {

    const queue =
        loadPostingQueue();


    const updatedQueue =
        queue.filter(
            (job) =>
                job.id !==
                jobId
        );


    savePostingQueue(
        updatedQueue
    );
}


// ==========================================
// CLEAR QUEUE
// ==========================================

export function clearPostingQueue() {

    localStorage.removeItem(
        QUEUE_KEY
    );
}


// ==========================================
// QUEUE STATS
// ==========================================

export function getQueueStats() {

    const queue =
        loadPostingQueue();


    return {

        total:
            queue.length,


        waiting:
            queue.filter(
                (job) =>
                    job.status ===
                    "waiting"
            ).length,


        processing:
            queue.filter(
                (job) =>
                    job.status ===
                    "processing"
            ).length,


        manualReady:
            queue.filter(
                (job) =>
                    job.status ===
                    "manual_ready"
            ).length,


        success:
            queue.filter(
                (job) =>
                    job.status ===
                    "success"
            ).length,


        failed:
            queue.filter(
                (job) =>
                    job.status ===
                    "failed"
            ).length,

    };
}


// ==========================================
// CAMPAIGN JOBS
// ==========================================
//
// Trả về các Job thuộc một Campaign.
// Job cũ không có campaignId sẽ không bị ảnh hưởng.
//

export function getCampaignJobs(
    campaignId
) {

    if (!campaignId) {
        return [];
    }


    const queue =
        loadPostingQueue();


    const id =
        String(campaignId);


    return queue.filter(
        (job) =>
            String(
                job.campaignId || ""
            ) ===
            id
    );
}


// ==========================================
// CAMPAIGN QUEUE STATS
// ==========================================

export function getCampaignQueueStats(
    campaignId
) {

    const jobs =
        getCampaignJobs(
            campaignId
        );


    return {

        total:
            jobs.length,


        waiting:
            jobs.filter(
                (job) =>
                    job.status ===
                    "waiting"
            ).length,


        processing:
            jobs.filter(
                (job) =>
                    job.status ===
                    "processing"
            ).length,


        manualReady:
            jobs.filter(
                (job) =>
                    job.status ===
                    "manual_ready"
            ).length,


        success:
            jobs.filter(
                (job) =>
                    job.status ===
                    "success"
            ).length,


        failed:
            jobs.filter(
                (job) =>
                    job.status ===
                    "failed"
            ).length,

    };
}