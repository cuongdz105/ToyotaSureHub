export async function generateAI(type) {

    await new Promise(resolve => setTimeout(resolve, 800));

    switch (type) {

        case "facebook":
            return "📱 Đây là nội dung Facebook mẫu.";

        case "tiktok":
            return "🎬 Đây là kịch bản TikTok mẫu.";

        case "youtube":
            return "🎥 Đây là nội dung YouTube mẫu.";

        case "seo":
            return "📰 Đây là bài SEO mẫu.";

        case "thumbnail":
            return "🖼 Đây là tiêu đề Thumbnail mẫu.";

        default:
            return "Không hỗ trợ loại AI này.";

    }

}