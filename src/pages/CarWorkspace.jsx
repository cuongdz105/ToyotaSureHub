import { useState } from "react";
import { useParams } from "react-router-dom";

import { getCarById, updateCar } from "../services/carService";
import Gallery from "../components/Gallery/Gallery";
import "../styles/CarWorkspace.css";

import {
  generateFacebookPost,
  generateYoutube,
  generateTikTok,
  generateSEO,
  generateThumbnail,
} from "../services/aiService";

import AIResultModal from "../components/AIResultModal";
import AIMenu from "../components/AIMenu";
import { saveHistory } from "../ai/history/historyService";
import CarActionBar from "../components/CarWorkspace/CarActionBar";
import CarInfo from "../components/CarWorkspace/CarInfo";
import { generateAll } from "../services/aiBatchService";
import MarketingCenter from "../components/CarWorkspace/MarketingCenter";
import WorkspaceCard from "../components/CarWorkspace/Card/WorkspaceCard";
import AICenter from "../components/CarWorkspace/AICenter";

import {
  findResearchSamples,
  buildResearchContext,
} from "../services/contentResearchService";


function CarWorkspace() {
  const { id } = useParams();

  const [car, setCar] =
    useState(() => getCarById(id));

  const [showAI, setShowAI] =
    useState(false);

  const [aiTitle, setAiTitle] =
    useState("");

  const [aiContent, setAiContent] =
    useState("");

  const [loadingAI, setLoadingAI] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  const [regenerateAction, setRegenerateAction] =
    useState(null);


  // =======================================
  // REFRESH XE
  // =======================================

  const refreshCar = () => {

    const updatedCar =
      getCarById(id);

    if (updatedCar) {

      setCar(updatedCar);

    }

  };


  // =======================================
  // RESEARCH CONTEXT
  // =======================================

  const getResearchContext =
    async (platform) => {

      const samples =
        await findResearchSamples(
          car,
          platform,
          5
        );

      return buildResearchContext(
        samples
      );

    };


  // =======================================
  // YOUTUBE AI + RESEARCH
  // =======================================

  const handleYoutubeAI =
    async () => {

      setLoadingAI(true);

      setShowAI(true);

      setRegenerateAction(
        () => handleYoutubeAI
      );


      try {

        console.log(
          "🔎 Đang tìm YouTube Research..."
        );


        const researchContext =
          await getResearchContext(
            "youtube"
          );


        console.log(
          "📚 YouTube Research Context:",
          researchContext
        );


        const result =
          await generateYoutube(
            car,
            researchContext
          );


        updateCar(
          car.id,
          {
            aiContent: {
              ...(car.aiContent || {}),
              youtube: result,
            },
          }
        );


        refreshCar();


        setAiTitle(
          "▶️ YouTube AI + Research"
        );


        setAiContent(
          result
        );


        saveHistory({
          type: "YouTube",

          title:
            "YouTube AI + Research",

          car:
            `${car.brand} ${car.model} ${car.year}`,

          content:
            result,
        });


      } catch (error) {

        console.error(
          "YouTube AI Error:",
          error
        );


        setAiTitle(
          "Lỗi"
        );


        setAiContent(
          "Không thể tạo nội dung YouTube AI."
        );


      } finally {

        setLoadingAI(false);

      }

    };


  // =======================================
  // FACEBOOK AI
  // =======================================

  const handleToyotaAI =
    async () => {

      try {

        setLoadingAI(true);

        setShowAI(true);

        setRegenerateAction(
          () => handleToyotaAI
        );


        const result =
          await generateFacebookPost(
            car
          );


        updateCar(
          car.id,
          {
            aiContent: {
              ...(car.aiContent || {}),
              facebook: result,
            },
          }
        );


        refreshCar();


        setAiTitle(
          "🤖 Toyota AI - Facebook"
        );


        setAiContent(
          result
        );


        saveHistory({
          type: "Facebook",

          title:
            "🤖 Toyota AI - Facebook",

          car:
            `${car.brand} ${car.model} ${car.year}`,

          content:
            result,
        });


      } catch (error) {

        console.error(
          "Facebook AI Error:",
          error
        );


        setAiTitle(
          "Lỗi"
        );


        setAiContent(
          "Không thể tạo nội dung AI."
        );


      } finally {

        setLoadingAI(false);

      }

    };


  // =======================================
  // TIKTOK AI + RESEARCH
  // =======================================

  const handleTikTokAI =
    async () => {

      setLoadingAI(true);

      setShowAI(true);

      setRegenerateAction(
        () => handleTikTokAI
      );


      try {

        console.log(
          "🔎 Đang tìm TikTok Research..."
        );


        const researchContext =
          await getResearchContext(
            "tiktok"
          );


        console.log(
          "📚 TikTok Research Context:",
          researchContext
        );


        const result =
          await generateTikTok(
            car,
            researchContext
          );


        updateCar(
          car.id,
          {
            aiContent: {
              ...(car.aiContent || {}),
              tiktok: result,
            },
          }
        );


        refreshCar();


        setAiTitle(
          "🎵 TikTok AI + Research"
        );


        setAiContent(
          result
        );


        saveHistory({
          type: "TikTok",

          title:
            "TikTok AI + Research",

          car:
            `${car.brand} ${car.model} ${car.year}`,

          content:
            result,
        });


      } catch (error) {

        console.error(
          "TikTok AI Error:",
          error
        );


        setAiTitle(
          "Lỗi"
        );


        setAiContent(
          "Không thể tạo nội dung TikTok AI."
        );


      } finally {

        setLoadingAI(false);

      }

    };


  // =======================================
  // SEO AI
  // =======================================

  const handleSEOAI =
    async () => {

      setLoadingAI(true);

      setShowAI(true);


      try {

        const result =
          await generateSEO(
            car
          );


        updateCar(
          car.id,
          {
            aiContent: {
              ...(car.aiContent || {}),
              seo: result,
            },
          }
        );


        refreshCar();


        setAiTitle(
          "📰 SEO AI"
        );


        setAiContent(
          result
        );


        saveHistory({
          type: "SEO",

          title:
            "SEO AI",

          car:
            `${car.brand} ${car.model} ${car.year}`,

          content:
            result,
        });


      } catch (error) {

        console.error(
          "SEO AI Error:",
          error
        );


        setAiTitle(
          "Lỗi"
        );


        setAiContent(
          "Không thể tạo SEO AI."
        );


      } finally {

        setLoadingAI(false);

      }

    };


  // =======================================
  // THUMBNAIL AI
  // =======================================

  const handleThumbnailAI =
    async () => {

      setLoadingAI(true);

      setShowAI(true);


      try {

        const result =
          await generateThumbnail(
            car
          );


        updateCar(
          car.id,
          {
            aiContent: {
              ...(car.aiContent || {}),
              thumbnail: result,
            },
          }
        );


        refreshCar();


        setAiTitle(
          "🖼 Thumbnail AI"
        );


        setAiContent(
          result
        );


      } catch (error) {

        console.error(
          "Thumbnail AI Error:",
          error
        );


        setAiTitle(
          "Lỗi"
        );


        setAiContent(
          "Không thể tạo Thumbnail AI."
        );


      } finally {

        setLoadingAI(false);

      }

    };


  // =======================================
  // COPY ALL
  // =======================================

  const handleCopyAll =
    () => {

      const ai =
        car.aiContent || {};


      const content =
        `📘 FACEBOOK
${ai.facebook || "Chưa có"}

==============================

🎬 TIKTOK
${ai.tiktok || "Chưa có"}

==============================

▶️ YOUTUBE
${ai.youtube || "Chưa có"}

==============================

📰 SEO
${ai.seo || "Chưa có"}

==============================

🖼 THUMBNAIL
${ai.thumbnail || "Chưa có"}
`;


      navigator.clipboard
        .writeText(
          content
        );


      alert(
        "✅ Đã copy toàn bộ AI!"
      );

    };


  // =======================================
  // DOWNLOAD
  // =======================================

  const handleDownloadAI =
    () => {

      const blob =
        new Blob(
          [aiContent],
          {
            type:
              "text/plain;charset=utf-8",
          }
        );


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        url;


      link.download =
        `${aiTitle}.txt`;


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );


      URL.revokeObjectURL(
        url
      );

    };


  // =======================================
  // OPEN SAVED AI
  // =======================================

  const openSavedAI =
    (type) => {

      const ai =
        car.aiContent || {};


      const content =
        ai[type];


      if (!content) {

        alert(
          "Chưa có nội dung."
        );

        return;

      }


      setAiTitle(
        `🤖 ${type.toUpperCase()}`
      );


      setAiContent(
        content
      );


      setLoadingAI(
        false
      );


      setShowAI(
        true
      );

    };


  // =======================================
  // GENERATE ALL
  // =======================================

  const handleGenerateAll =
    async () => {

      try {

        setLoadingAI(
          true
        );


        const result =
          await generateAll(
            car
          );


        updateCar(
          car.id,
          {
            aiContent:
              result,
          }
        );


        setAiTitle(
          "🚀 Generate All"
        );


        setAiContent(
          "✅ Đã tạo Facebook\n" +
          "✅ Đã tạo TikTok\n" +
          "✅ Đã tạo YouTube\n" +
          "✅ Đã tạo SEO\n" +
          "✅ Đã tạo Thumbnail"
        );


        setShowAI(
          true
        );


      } catch (err) {

        console.error(
          err
        );

      } finally {

        setLoadingAI(
          false
        );

      }

    };


  // =======================================
  // NO CAR
  // =======================================

  if (!car) {

    return (

      <div className="app">

        <main className="content">

          <h2>
            ❌ Không tìm thấy xe
          </h2>

        </main>

      </div>

    );

  }


  // =======================================
  // UI
  // =======================================

  return (

    <div className="app">

      <main className="content">

        <h1>
          🚗 Car Workspace
        </h1>

        <p>
          Quản lý toàn bộ nội dung
          của chiếc xe.
        </p>


        <CarActionBar

          onBack={() => {}}

          onEdit={() => {}}

          onDelete={() => {}}

          onAI={() =>
            setShowMenu(
              true
            )
          }


          onFacebook={() => {

            console.log(
              "Facebook",
              car
            );

          }}


          onTikTok={() => {

            console.log(
              "TikTok",
              car
            );

          }}


          onYoutube={() => {

            console.log(
              "YouTube",
              car
            );

          }}

        />


        <WorkspaceCard
          title="📦 Thông tin xe"
        >

          <CarInfo
            car={car}
            onViewAI={
              openSavedAI
            }
          />

        </WorkspaceCard>


        <WorkspaceCard
          title="📸 Hình ảnh"
        >

          <Gallery
            images={
              car.images
            }
          />

        </WorkspaceCard>


        <WorkspaceCard
          title="🤖 AI Center"
        >

          <AICenter

            car={
              car
            }

            onViewAI={
              openSavedAI
            }

            onGenerateAll={
              handleGenerateAll
            }

            onSalesChat={() => {

              alert(
                "🚧 AI Sales Assistant đang phát triển..."
              );

            }}

          />

        </WorkspaceCard>


        <WorkspaceCard
          title="📣 Marketing"
        >

          <MarketingCenter
            car={
              car
            }
          />

        </WorkspaceCard>

      </main>


      {/* =====================================
          AI MENU
      ===================================== */}

      <AIMenu

        open={
          showMenu
        }

        onClose={() =>
          setShowMenu(
            false
          )
        }


        onGenerateAll={() => {

          setShowMenu(
            false
          );

          handleGenerateAll();

        }}


        onFacebook={() => {

          setShowMenu(
            false
          );

          handleToyotaAI();

        }}


        onYoutube={() => {

          setShowMenu(
            false
          );

          handleYoutubeAI();

        }}


        onTikTok={() => {

          setShowMenu(
            false
          );

          handleTikTokAI();

        }}


        onSEO={() => {

          setShowMenu(
            false
          );

          handleSEOAI();

        }}


        onThumbnail={() => {

          setShowMenu(
            false
          );

          handleThumbnailAI();

        }}

      />


      {/* =====================================
          AI RESULT
      ===================================== */}

      <AIResultModal

        open={
          showAI
        }

        title={
          aiTitle
        }

        content={
          aiContent
        }

        loading={
          loadingAI
        }

        onClose={() =>
          setShowAI(
            false
          )
        }

        onCopy={() => {

          navigator.clipboard
            .writeText(
              aiContent
            );

          alert(
            "✅ Đã copy nội dung!"
          );

        }}

        onCopyAll={
          handleCopyAll
        }

        onDownload={
          handleDownloadAI
        }

        onRegenerate={
          regenerateAction
        }

      />

    </div>

  );

}

export default CarWorkspace;