import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { getCarById } from "../services/carService";
import Gallery from "../components/Gallery/Gallery";
import "../styles/CarDetail.css";
import { generateFacebookPost } from "../services/aiService";

function CarDetail() {
  const { id } = useParams();

  const car = getCarById(id);

  const handleToyotaAI = async () => {
  const result = await generateFacebookPost(car);

  alert(result);
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
  onClick={handleToyotaAI}
>
  🤖 Toyota AI
</button>

  <button className="btn-video">🎥 Video</button>

  <button className="btn-post">📱 Facebook</button>
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
    </div>
  );
}

export default CarDetail;