import "./MarketingCenter.css";
import CampaignEngine from "../../engine/CampaignEngine";

function MarketingCenter({ car }) {

    const createCampaign = (platform) => {

    const campaign = CampaignEngine.start({
        carId: car.id,
        platform,
    });

    console.log(campaign);

    alert(`Đã tạo ${platform} Campaign`);
};

    return (
        <div className="marketing-center">

            <h2>📣 Marketing Center</h2>

            <div className="marketing-grid">

                <div className="marketing-card">
                    <h3>📘 Facebook</h3>

                    <p>Campaign: Chưa tạo</p>

                   <button onClick={() => createCampaign("facebook")}>
    Tạo Campaign
</button>
                </div>

                <div className="marketing-card">
                    <h3>🎬 TikTok</h3>

                    <p>Campaign: Chưa tạo</p>

                    <button onClick={() => createCampaign("tiktok")}>
    Tạo Campaign
</button>
                </div>

                <div className="marketing-card">
                    <h3>▶️ YouTube</h3>

                    <p>Campaign: Chưa tạo</p>

                   <button onClick={() => createCampaign("youtube")}>
    Tạo Campaign
</button>
                </div>

            </div>

        </div>
    );
}

export default MarketingCenter;