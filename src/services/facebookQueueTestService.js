// =======================================
// ToyotaSureHub
// Facebook Queue Test Service
// Version 1.2
// =======================================
//
// DEV ONLY
//
// Tạo Job FAILED giả để test Error Handling.
//
// QUAN TRỌNG:
// Không dùng addToPostingQueue() vì hàm đó có
// validation dữ liệu thật (ảnh, nội dung, quyền account).
//
// Test Job được ghi trực tiếp vào Queue.
// Không gọi Facebook API.
// Không đăng Facebook thật.
// =======================================

import {
    loadPostingQueue,
    savePostingQueue,
    updateQueueJob,
} from "./facebookPostingQueueService";


// =======================================
// TEST ERROR TYPES
// =======================================

export const QUEUE_TEST_ERRORS = {

    PERMISSION: "permission",

    ACCOUNT: "account",

    IMAGE: "image",

    CONTENT: "content",

    GROUP: "group",

};


// =======================================
// TEST ERROR MESSAGES
// =======================================

const ERROR_MESSAGES = {

    permission:
        "Tài khoản Facebook không có quyền đăng vào hội nhóm này.",

    account:
        "Tài khoản Facebook đang không hoạt động.",

    image:
        "Xe chưa có ảnh để đăng.",

    content:
        "Nội dung Facebook đang trống.",

    group:
        "Hội nhóm Facebook không khả dụng.",

};


// =======================================
// CREATE TEST JOB ID
// =======================================

function createTestJobId() {

    return (
        `test_${Date.now()}_` +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );

}


// =======================================
// CREATE FAILED TEST JOB
// =======================================

export function createFacebookQueueTestJob(
    errorType =
        QUEUE_TEST_ERRORS.PERMISSION
) {

    // --------------------------------------
    // Validate error type
    // --------------------------------------

    if (
        !Object.values(
            QUEUE_TEST_ERRORS
        ).includes(errorType)
    ) {

        throw new Error(
            `Loại lỗi test không hợp lệ: ${errorType}`
        );

    }


    // --------------------------------------
    // Load current queue
    // --------------------------------------

    const queue =
        loadPostingQueue();


    // --------------------------------------
    // Find a real job as template
    // --------------------------------------

    const baseJob =
        queue.find(
            (job) =>
                job &&
                job.group &&
                job.accountId &&
                job.carId
        );


    if (!baseJob) {

        throw new Error(
            "Chưa có Job mẫu trong Queue. Hãy thêm ít nhất 1 bài vào Queue trước khi chạy Test Error."
        );

    }


    const now =
        new Date().toISOString();


    // --------------------------------------
    // Create safe copy
    // --------------------------------------

    const testJob = {

        ...baseJob,

        id:
            createTestJobId(),

        status:
            "failed",

        error:
            ERROR_MESSAGES[
                errorType
            ],

        retryCount:
            0,

        result:
            null,

        testMode:
            true,

        testErrorType:
            errorType,

        createdAt:
            now,

        updatedAt:
            now,

        logs: [

            ...(Array.isArray(
                baseJob.logs
            )
                ? baseJob.logs
                : []),

            {

                message:
                    `🧪 DEV TEST: ${ERROR_MESSAGES[errorType]}`,

                timestamp:
                    now,

            },

        ],

    };


    // --------------------------------------
    // Ghi trực tiếp vào Queue
    //
    // Không dùng addToPostingQueue()
    // để Test Image / Content không bị
    // validation chặn.
    // --------------------------------------

    savePostingQueue([

        ...queue,

        testJob,

    ]);


    console.log(
        "🧪 Facebook Queue Test Job Created:",
        testJob
    );


    return testJob;

}


// =======================================
// RESET TEST JOB
// =======================================

export function resetFacebookQueueTestJob(
    jobId
) {

    const queue =
        loadPostingQueue();


    const job =
        queue.find(
            (item) =>
                item.id === jobId
        );


    if (!job) {

        return null;

    }


    if (!job.testMode) {

        throw new Error(
            "Job này không phải Test Job."
        );

    }


    return updateQueueJob(

        jobId,

        {

            status:
                "waiting",

            error:
                null,

            retryCount:
                0,

            result:
                null,

            testMode:
                false,

            testErrorType:
                null,

        }

    );

}


// =======================================
// TEST TYPES
// =======================================

export function getFacebookQueueTestTypes() {

    return [

        {

            type:
                QUEUE_TEST_ERRORS.PERMISSION,

            label:
                "🔐 Test lỗi quyền nhóm",

        },

        {

            type:
                QUEUE_TEST_ERRORS.ACCOUNT,

            label:
                "👤 Test lỗi tài khoản",

        },

        {

            type:
                QUEUE_TEST_ERRORS.IMAGE,

            label:
                "📷 Test lỗi ảnh",

        },

        {

            type:
                QUEUE_TEST_ERRORS.CONTENT,

            label:
                "📝 Test lỗi nội dung",

        },

        {

            type:
                QUEUE_TEST_ERRORS.GROUP,

            label:
                "👥 Test lỗi nhóm",

        },

    ];

}