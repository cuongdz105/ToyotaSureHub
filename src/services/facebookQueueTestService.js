// =======================================
// ToyotaSureHub
// Facebook Queue Test Service
// Version 1.1
// =======================================
//
// DEV ONLY.
//
// Tạo một Job FAILED giả từ dữ liệu Queue hiện có
// để kiểm tra Error Handling.
//
// Không gọi Facebook API.
// Không đăng Facebook thật.
//
// =======================================

import {
    loadPostingQueue,
    addToPostingQueue,
    updateQueueJob,
    removeQueueJob,
} from "./facebookPostingQueueService";


// =======================================
// TEST ERROR TYPES
// =======================================

export const QUEUE_TEST_ERRORS = {

    PERMISSION:
        "permission",

    ACCOUNT:
        "account",

    IMAGE:
        "image",

    CONTENT:
        "content",

    GROUP:
        "group",

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
        "Bài đăng chưa có nội dung Facebook.",

    group:
        "Hội nhóm Facebook không khả dụng.",

};


// =======================================
// CREATE FAILED TEST JOB
// =======================================

export function createFacebookQueueTestJob(
    errorType =
        QUEUE_TEST_ERRORS.PERMISSION
) {

    if (
        !Object.values(
            QUEUE_TEST_ERRORS
        ).includes(
            errorType
        )
    ) {

        throw new Error(
            `Loại lỗi test không hợp lệ: ${errorType}`
        );
    }


    const queue =
        loadPostingQueue();


    /**
     * Ưu tiên lấy một Job hiện có
     * để giữ nguyên carId / accountId / groupId thật.
     *
     * Như vậy khi test:
     *
     * 🔧 Sửa quyền
     *
     * hệ thống có thể mở đúng Account/Group
     * thay vì dùng ID giả.
     */

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


    const newJob =
        addToPostingQueue({

            carId:
                baseJob.carId,

            group:
                baseJob.group,

            content:
                errorType ===
                QUEUE_TEST_ERRORS.CONTENT
                    ? ""
                    : (
                        baseJob.content ||
                        "🧪 TEST FACEBOOK QUEUE"
                    ),

            imageCount:
                errorType ===
                QUEUE_TEST_ERRORS.IMAGE
                    ? 0
                    : (
                        baseJob.imageCount ||
                        1
                    ),

            accountId:
                baseJob.accountId,

        });


    if (!newJob?.id) {

        throw new Error(
            "Không tạo được Test Job."
        );
    }


    /**
     * Chuyển Job vừa tạo:
     *
     * waiting
     *    ↓
     * failed
     */

    const failedJob =
        updateQueueJob(

            newJob.id,

            {

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

                updatedAt:
                    new Date().toISOString(),

            }

        );


    return failedJob;
}


// =======================================
// REMOVE ALL TEST JOBS
// =======================================
//
// Chỉ xóa Job có testMode === true.
// Job thật không bị ảnh hưởng.
//

export function removeAllFacebookQueueTestJobs() {

    const queue =
        loadPostingQueue();

    const testJobs =
        queue.filter(
            (job) =>
                job &&
                job.testMode === true
        );

    testJobs.forEach(
        (job) => {
            removeQueueJob(job.id);
        }
    );

    return testJobs.length;
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
