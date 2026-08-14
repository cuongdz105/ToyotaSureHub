// ==========================================
// ToyotaSureHub V11
// Facebook Campaign Service
// ==========================================
//
// Campaign = hồ sơ quản lý chiến dịch.
// Queue = nơi lưu và thực thi các Job.
//
// QUAN TRỌNG:
// Campaign KHÔNG lưu ảnh base64.
// Campaign KHÔNG lưu full content.
// Mục tiêu là tránh làm đầy localStorage.
//
// ==========================================

const CAMPAIGN_STORAGE_KEY =
    "toyota_sure_hub_facebook_campaigns";


// ==========================================
// LOAD
// ==========================================

export function loadCampaigns() {

    try {

        const raw =
            localStorage.getItem(
                CAMPAIGN_STORAGE_KEY
            );

        if (!raw) {
            return [];
        }

        const data =
            JSON.parse(raw);

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "❌ Không đọc được Facebook Campaigns:",
            error
        );

        return [];
    }
}


// ==========================================
// SAVE
// ==========================================

function saveCampaigns(
    campaigns
) {

    try {

        localStorage.setItem(
            CAMPAIGN_STORAGE_KEY,
            JSON.stringify(campaigns)
        );

        return campaigns;

    } catch (error) {

        console.error(
            "❌ Không thể lưu Facebook Campaigns:",
            error
        );

        if (
            error?.name ===
            "QuotaExceededError"
        ) {

            throw new Error(
                "Bộ nhớ trình duyệt đã đầy. " +
                "Không thể lưu Campaign mới."
            );
        }

        throw error;
    }
}


// ==========================================
// CREATE ID
// ==========================================

function createCampaignId() {

    return (
        `campaign_${Date.now()}_` +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


// ==========================================
// CAR SNAPSHOT GỌN
// ==========================================

function createCarSnapshot(
    car
) {

    if (!car) {
        return null;
    }

    return {

        id:
            car.id ?? null,

        brand:
            car.brand ?? "",

        model:
            car.model ?? "",

        version:
            car.version ?? "",

        year:
            car.year ?? "",

        color:
            car.color ?? "",

        odo:
            car.odo ?? null,

        price:
            car.price ?? null,

        warranty:
            car.warranty ?? "",

        legal:
            car.legal ?? "",

        status:
            car.status ?? "",

    };
}


// ==========================================
// ACCOUNT SNAPSHOT GỌN
// ==========================================

function createAccountSnapshot(
    account
) {

    if (!account) {
        return null;
    }

    return {

        id:
            account.id ?? null,

        name:
            account.name ?? "",

        status:
            account.status ?? "",

    };
}


// ==========================================
// GROUP SNAPSHOT GỌN
// ==========================================

function createGroupSnapshot(
    group
) {

    if (!group) {
        return null;
    }

    return {

        id:
            group.id ?? null,

        name:
            group.name ?? "",

        matchScore:
            Number(
                group.matchScore || 0
            ),

        status:
            group.status ?? "",

    };
}


// ==========================================
// CREATE CAMPAIGN
// ==========================================

export function createCampaign({

    car,
    account,
    selectedGroups = [],
    content = "",
    imageCount = 0,

}) {

    if (!car?.id) {

        throw new Error(
            "Campaign chưa có xe."
        );
    }


    if (!account?.id) {

        throw new Error(
            "Campaign chưa có tài khoản Facebook."
        );
    }


    if (
        !Array.isArray(
            selectedGroups
        ) ||
        selectedGroups.length === 0
    ) {

        throw new Error(
            "Campaign chưa có nhóm Facebook."
        );
    }


    const now =
        new Date().toISOString();


    const campaign = {

        // ----------------------------------
        // ID
        // ----------------------------------

        id:
            createCampaignId(),

        version:
            2,

        type:
            "facebook_group_campaign",

        status:
            "draft",

        createdAt:
            now,

        updatedAt:
            now,


        // ----------------------------------
        // XE
        // ----------------------------------

        carId:
            String(car.id),

        carSnapshot:
            createCarSnapshot(car),


        // ----------------------------------
        // FACEBOOK ACCOUNT
        // ----------------------------------

        accountId:
            String(account.id),

        accountSnapshot:
            createAccountSnapshot(
                account
            ),


        // ----------------------------------
        // GROUPS
        // ----------------------------------

        selectedGroupIds:
            selectedGroups.map(
                (group) =>
                    String(group.id)
            ),

        groupSnapshots:
            selectedGroups.map(
                createGroupSnapshot
            ),


        // ----------------------------------
        // CONTENT
        // ----------------------------------
        // Chỉ lưu tối đa 500 ký tự.
        // Full content nằm ở Queue Job.

        contentPreview:
            String(
                content || ""
            ).slice(
                0,
                500
            ),

        imageCount:
            Number(
                imageCount || 0
            ),


        // ----------------------------------
        // PROGRESS
        // ----------------------------------

        totalJobs:
            selectedGroups.length,

        waitingJobs:
            selectedGroups.length,

        processingJobs:
            0,

        successJobs:
            0,

        failedJobs:
            0,

        completedJobs:
            0,


        // ----------------------------------
        // QUEUE JOB IDS
        // ----------------------------------

        jobIds:
            [],


        startedAt:
            null,

        completedAt:
            null,

    };


    const campaigns =
        loadCampaigns();


    campaigns.push(
        campaign
    );


    saveCampaigns(
        campaigns
    );


    console.log(
        "✅ Facebook Campaign created:",
        campaign
    );


    return campaign;
}


// ==========================================
// GET CAMPAIGN
// ==========================================

export function getCampaign(
    campaignId
) {

    const campaigns =
        loadCampaigns();


    return (
        campaigns.find(
            (campaign) =>
                String(
                    campaign.id
                ) ===
                String(
                    campaignId
                )
        ) || null
    );
}


// ==========================================
// UPDATE CAMPAIGN
// ==========================================

export function updateCampaign(
    campaignId,
    updates = {}
) {

    const campaigns =
        loadCampaigns();


    const index =
        campaigns.findIndex(
            (campaign) =>
                String(
                    campaign.id
                ) ===
                String(
                    campaignId
                )
        );


    if (index < 0) {

        throw new Error(
            "Không tìm thấy Campaign."
        );
    }


    const current =
        campaigns[index];


    const updated = {

        ...current,

        ...updates,

        id:
            current.id,

        createdAt:
            current.createdAt,

        updatedAt:
            new Date()
                .toISOString(),

    };


    campaigns[index] =
        updated;


    saveCampaigns(
        campaigns
    );


    return updated;
}


// ==========================================
// ATTACH QUEUE JOBS
// ==========================================

export function attachCampaignJobs(
    campaignId,
    jobIds = []
) {

    const campaign =
        getCampaign(
            campaignId
        );


    if (!campaign) {

        throw new Error(
            "Không tìm thấy Campaign."
        );
    }


    const mergedJobIds =
        Array.from(
            new Set([

                ...(campaign.jobIds || []),

                ...jobIds.map(
                    (id) =>
                        String(id)
                ),

            ])
        );


    return updateCampaign(
        campaignId,
        {

            jobIds:
                mergedJobIds,

            totalJobs:
                mergedJobIds.length,

            waitingJobs:
                mergedJobIds.length,

        }
    );
}


// ==========================================
// SET STATUS
// ==========================================

export function setCampaignStatus(
    campaignId,
    status
) {

    const allowedStatuses = [

        "draft",
        "queued",
        "running",
        "paused",
        "completed",
        "failed",
        "cancelled",

    ];


    if (
        !allowedStatuses.includes(
            status
        )
    ) {

        throw new Error(
            `Trạng thái Campaign không hợp lệ: ${status}`
        );
    }


    const updates = {

        status,

    };


    if (
        status ===
        "running"
    ) {

        updates.startedAt =
            new Date()
                .toISOString();
    }


    if (
        status === "completed" ||
        status === "failed" ||
        status === "cancelled"
    ) {

        updates.completedAt =
            new Date()
                .toISOString();
    }


    return updateCampaign(
        campaignId,
        updates
    );
}


// ==========================================
// SYNC PROGRESS
// ==========================================

export function syncCampaignProgress(
    campaignId,
    jobs = []
) {

    const campaign =
        getCampaign(
            campaignId
        );


    if (!campaign) {

        throw new Error(
            "Không tìm thấy Campaign."
        );
    }


    const campaignJobIds =
        new Set(
            (
                campaign.jobIds ||
                []
            ).map(
                (id) =>
                    String(id)
            )
        );


    const campaignJobs =
        jobs.filter(
            (job) =>
                campaignJobIds.has(
                    String(job.id)
                )
        );


    const successJobs =
        campaignJobs.filter(
            (job) =>
                job.status ===
                "success"
        ).length;


    const failedJobs =
        campaignJobs.filter(
            (job) =>
                job.status ===
                "failed"
        ).length;


    const processingJobs =
        campaignJobs.filter(
            (job) =>
                job.status ===
                "processing"
        ).length;


    const waitingJobs =
        campaignJobs.filter(
            (job) =>
                job.status ===
                "waiting"
        ).length;


    const completedJobs =
        successJobs +
        failedJobs;


    let status =
        campaign.status;


    if (
        campaignJobs.length > 0 &&
        completedJobs ===
            campaignJobs.length
    ) {

        status =
            failedJobs > 0 &&
            successJobs === 0
                ? "failed"
                : "completed";

    } else if (
        processingJobs > 0
    ) {

        status =
            "running";

    } else if (
        waitingJobs > 0
    ) {

        status =
            "queued";
    }


    return updateCampaign(
        campaignId,
        {

            status,

            totalJobs:
                campaignJobs.length,

            completedJobs,

            successJobs,

            failedJobs,

            waitingJobs,

            processingJobs,

        }
    );
}


// ==========================================
// DELETE CAMPAIGN
// ==========================================

export function deleteCampaign(
    campaignId
) {

    const campaigns =
        loadCampaigns();


    const next =
        campaigns.filter(
            (campaign) =>
                String(
                    campaign.id
                ) !==
                String(
                    campaignId
                )
        );


    saveCampaigns(
        next
    );


    return true;
}


// ==========================================
// CLEAR ALL CAMPAIGNS
// ==========================================
// Chỉ dùng khi DEV / RESET.
// Không gọi trong Queue bình thường.
//

export function clearCampaigns() {

    localStorage.removeItem(
        CAMPAIGN_STORAGE_KEY
    );

    return [];
}


// ==========================================
// STORAGE KEY
// ==========================================

export const FACEBOOK_CAMPAIGN_STORAGE_KEY =
    CAMPAIGN_STORAGE_KEY;