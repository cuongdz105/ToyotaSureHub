import { useState } from "react";
import { useParams } from "react-router-dom";

import { getCarById } from "../services/carService";
import Gallery from "../components/Gallery/Gallery";
import "../styles/CarWorkspace.css";
import {
    generateFacebookPost,
    generateYoutube,
    generateTikTok,
    generateSEO,
    generateThumbnail
} from "../services/aiService";
import AIResultModal from "../components/AIResultModal";
import AIMenu from "../components/AIMenu";
import { saveHistory } from "../ai/history/historyService";
import CarActionBar from "../components/CarWorkspace/CarActionBar";
import CarInfo from "../components/CarWorkspace/CarInfo";
import { updateCar } from "../services/carService";
import { generateAll } from "../services/aiBatchService";

function CarWorkspace() {
  const { id } = useParams();

  const [car, setCar] = useState(() => getCarById(id));

  const [showAI, setShowAI] = useState(false);
const [aiTitle, setAiTitle] = useState("");
const [aiContent, setAiContent] = useState("");
const [loadingAI, setLoadingAI] = useState(false);
const [showMenu, setShowMenu] = useState(false);
const [regenerateAction, setRegenerateAction] = useState(null);
const refreshCar = () => {
    const updatedCar = getCarById(id);

    if (updatedCar) {
        setCar(updatedCar);
    }
};


const handleToyotaAI = async () => {

      try {

    setLoadingAI(true);
    setShowAI(true);
    setRegenerateAction(() => handleToyotaAI);

   
    const result = await generateFacebookPost(car);
    updateCar(car.id, {
  aiContent: {
    ...(car.aiContent || {}),
    facebook: result,
  },
});

refreshCar();

console.log("Đã update:", getCarById(car.id));

    setAiTitle("🤖 Toyota AI - Facebook");

    setAiContent(result);
   saveHistory({
  type: "Facebook",
  title: "🤖 Toyota AI - Facebook",
  car: `${car.brand} ${car.model} ${car.year}`,
  content: result,
});


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
    setRegenerateAction(() => handleYoutubeAI);

    const result = await generateYoutube(car);

    setAiTitle("YouTube AI");

    setAiContent(result);
    saveHistory({
  type: "YouTube",
  title: "YouTube AI",
  car: `${car.brand} ${car.model} ${car.year}`,
  content: result,
});


    setLoadingAI(false);

};

const handleTikTokAI = async () => {

  setLoadingAI(true);
  setShowAI(true);
  setRegenerateAction(() => handleTikTokAI);

  const result = await generateTikTok(car);

  setAiTitle("🎬 TikTok AI");

  setAiContent(result);
  saveHistory({
  type: "TikTok",
  title: "🎬 TikTok AI",
  car: `${car.brand} ${car.model} ${car.year}`,
  content: result,
});


  setLoadingAI(false);

};

const handleSEOAI = async () => {

    setLoadingAI(true);
    setShowAI(true);

    const result = await generateSEO(car);

    setAiTitle("📰 SEO AI");

    setAiContent(result);
    saveHistory({
  type: "SEO",
  title: "SEO AI",
  car: `${car.brand} ${car.model} ${car.year}`,
  content: result,
});

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

const handleDownloadAI = () => {
  const blob = new Blob([aiContent], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${aiTitle}.txt`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const openSavedAI = (type) => {
  const ai = car.aiContent || {};

  const content = ai[type];

  if (!content) {
    alert("Chưa có nội dung.");
    return;
  }

  setAiTitle(`🤖 ${type.toUpperCase()}`);

  setAiContent(content);

  setLoadingAI(false);

  setShowAI(true);
};

const handleGenerateAll = async () => {
  try {
    setLoadingAI(true);

    const result = await generateAll(car);

    updateCar(car.id, {
      aiContent: result,
    });

        setAiTitle("🚀 Generate All");

    setAiContent(
      "✅ Đã tạo Facebook\n" +
      "✅ Đã tạo TikTok\n" +
      "✅ Đã tạo YouTube\n" +
      "✅ Đã tạo SEO\n" +
      "✅ Đã tạo Thumbnail"
    );

    setShowAI(true);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingAI(false);
  }
};

  if (!car) {
    return (
      
      <div className="app">
        
        <main className="content">
          <h2>❌ Không tìm thấy xe</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="app">

          
      <main className="content">
       <h1>🚗 Car Workspace</h1>
<p>Quản lý toàn bộ nội dung của chiếc xe.</p>

       
       <CarActionBar
    onBack={() => {}}
    onEdit={() => {}}
    onDelete={() => {}}
    onAI={() => setShowMenu(true)}
/>

   <CarInfo
  car={car}
  onViewAI={openSavedAI}
/>
   <Gallery images={car.images} />
      </main>

<AIMenu
    open={showMenu}
    onClose={() => setShowMenu(false)}

    onGenerateAll={() => {
    setShowMenu(false);
    handleGenerateAll();
}}

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
    onCopy={() => {
        navigator.clipboard.writeText(aiContent);
        alert("✅ Đã copy nội dung!");
    }}
    onDownload={handleDownloadAI}
    onRegenerate={regenerateAction}
/>

    </div>
  );
}

export default CarWorkspace;