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

                <div className="ai-menu">

                    <button onClick={onFacebook}>
                        📱 Facebook
                    </button>

                    <button onClick={onYoutube}>
                        🎥 YouTube
                    </button>

                    <button onClick={onTikTok}>
                        🎬 TikTok
                    </button>

                    <button onClick={onSEO}>
                        📰 SEO
                    </button>

                    <button onClick={onThumbnail}>
                        🖼 Thumbnail
                    </button>

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