import "./MarketingCenter.css";
import CampaignEngine from "../../engine/CampaignEngine";
import PlatformCard from "./PlatformCard";

function MarketingCenter({ car }) {

    const ai = car.aiContent || {};

    const createCampaign = (platform) => {

        const campaign = CampaignEngine.start({
            carId: car.id,
            platform,
        });

        console.log(campaign);

        alert(`Đã tạo ${platform} Campaign`);
    };

    const platforms = [
        {
            key: "facebook",
            icon: "📘",
            title: "Facebook",
            generated: !!ai.facebook,
        },
        {
            key: "tiktok",
            icon: "🎬",
            title: "TikTok",
            generated: !!ai.tiktok,
        },
        {
            key: "youtube",
            icon: "▶️",
            title: "YouTube",
            generated: !!ai.youtube,
        },
        {
            key: "seo",
            icon: "📰",
            title: "SEO",
            generated: !!ai.seo,
        },
    ];

    return (
        <div className="marketing-center">

            
            <div className="marketing-grid">

                {platforms.map((platform) => (

                    <PlatformCard
                        key={platform.key}
                        icon={platform.icon}
                        title={platform.title}
                        generated={platform.generated}
                        published={false}

                        onView={() =>
                            alert(`Xem ${platform.title}`)
                        }

                        onPublish={() =>
                            createCampaign(platform.key)
                        }
                    />

                ))}

            </div>

        </div>
    );
}

export default MarketingCenter;