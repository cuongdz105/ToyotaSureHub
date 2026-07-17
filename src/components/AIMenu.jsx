import "../styles/AIMenu.css";

function AIMenu({

    open,

    onClose,

    onFacebook,

    onYoutube,

    onTikTok,

    onSEO,

    onThumbnail,

}) {

    if (!open) return null;

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>🤖 Toyota AI</h2>

               <div className="ai-card" onClick={onFacebook}>
    <h3>📱 Facebook</h3>
    <p>Viết bài bán xe chuẩn hội nhóm.</p>
</div>

<div className="ai-card" onClick={onYoutube}>
    <h3>🎥 YouTube</h3>
    <p>Tiêu đề + mô tả + hashtag SEO.</p>
</div>

<div className="ai-card" onClick={onTikTok}>
    <h3>🎬 TikTok</h3>
    <p>Kịch bản video 60 giây.</p>
</div>

<div className="ai-card" onClick={onSEO}>
    <h3>📰 SEO</h3>
    <p>Bài viết chuẩn Google.</p>
</div>

<div className="ai-card" onClick={onThumbnail}>
    <h3>🖼 Thumbnail</h3>
    <p>Tiêu đề thumbnail tăng CTR.</p>
</div>

                <br />

                <button onClick={onClose}>
                    Đóng
                </button>

            </div>

        </div>

    );

}

export default AIMenu;