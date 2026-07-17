import { useState } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { getCarById } from "../services/carService";
import Gallery from "../components/Gallery/Gallery";
import "../styles/CarDetail.css";
import {
    generateFacebookPost,
    generateYoutube,
    generateTikTok,
    generateSEO,
    generateThumbnail
} from "../services/aiService";
import AIResultModal from "../components/AIResultModal";
import AIMenu from "../components/AIMenu";


function CarDetail() {
  const { id } = useParams();

  const car = getCarById(id);

  const [showAI, setShowAI] = useState(false);
const [aiTitle, setAiTitle] = useState("");
const [aiContent, setAiContent] = useState("");
const [loadingAI, setLoadingAI] = useState(false);
const [showMenu, setShowMenu] = useState(false);


const handleToyotaAI = async () => {

      try {

    setLoadingAI(true);
    setShowAI(true);

   
    const result = await generateFacebookPost(car);

    setAiTitle("🤖 Toyota AI - Facebook");

    setAiContent(result);

  } catch (error) {

    setAiTitle("Lỗi");

    setAiContent("Không thể tạo nội dung AI.");

    console.error(error);

  } finally {

    setLoadingAI(false);

  }

};


const handleYoutubeAI = async () => {

    setLoadingAI(true);
    setShowAI(true);

    const result = await generateYoutube(car);

    setAiTitle("YouTube AI");

    setAiContent(result);

    setLoadingAI(false);

};

const handleTikTokAI = async () => {

  setLoadingAI(true);
  setShowAI(true);

  const result = await generateTikTok(car);

  setAiTitle("🎬 TikTok AI");

  setAiContent(result);

  setLoadingAI(false);

};

const handleSEOAI = async () => {

    setLoadingAI(true);
    setShowAI(true);

    const result = await generateSEO(car);

    setAiTitle("📰 SEO AI");

    setAiContent(result);

    setLoadingAI(false);

};

const handleThumbnailAI = async () => {

    setLoadingAI(true);
    setShowAI(true);

    const result = await generateThumbnail(car);

    setAiTitle("🖼 Thumbnail AI");

    setAiContent(result);

    setLoadingAI(false);

};

  if (!car) {
    return (
      <div className="app">
        <Sidebar />

        <main className="content">
          <h2>❌ Không tìm thấy xe</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <h1>🚗 Chi tiết xe</h1>

       
        <div className="action-bar">
  <button className="btn-back">⬅ Quay lại</button>

  <button className="btn-edit">✏️ Sửa</button>

  <button className="btn-delete">🗑 Xóa</button>

  <button
    className="btn-ai"
    onClick={() => setShowMenu(true)}
>
    🤖 Toyota AI
</button>

 
</div>

   <h2>
  {car.brand} {car.model} {car.version}
</h2>

<Gallery images={car.images} />

<hr />

        <hr />

        <p><b>Năm:</b> {car.year}</p>
        <p><b>Màu:</b> {car.color}</p>
        <p><b>ODO:</b> {(Number(car.odo) * 10000).toLocaleString("vi-VN")} km</p>
        <p><b>Giá:</b> {car.price}</p>
        <p><b>Bảo hành:</b> {car.warranty}</p>
        <p><b>Pháp lý:</b> {car.legal}</p>
        <p><b>Trạng thái:</b> {car.status}</p>
      </main>

<AIMenu
    open={showMenu}
    onClose={() => setShowMenu(false)}

    onFacebook={() => {
        setShowMenu(false);
        handleToyotaAI();
    }}

    onYoutube={() => {
        setShowMenu(false);
        handleYoutubeAI();
    }}

   onTikTok={() => {
    setShowMenu(false);
    handleTikTokAI();
}}

onSEO={() => {
    setShowMenu(false);
    handleSEOAI();
}}

onThumbnail={() => {
    setShowMenu(false);
    handleThumbnailAI();
}}
/>

<AIResultModal
    open={showAI}
    title={aiTitle}
    content={aiContent}
    loading={loadingAI}
    onClose={() => setShowAI(false)}
    onCopy={() => navigator.clipboard.writeText(aiContent)}
    onRegenerate={() => {}}
/>

    </div>
  );
}

export default CarDetail;