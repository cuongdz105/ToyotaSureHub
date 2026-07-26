import Gallery from "../Gallery/Gallery";

function CarInfo({ car, onViewAI }) {
  const ai = car.aiContent || {};

  return (
    <section className="car-info">

      <h2>
        {car.brand} {car.model} {car.version}
      </h2>

      <Gallery images={car.images} />

      <hr />

      <p><b>Năm:</b> {car.year}</p>

      <p><b>Màu:</b> {car.color}</p>

      <p>
        <b>ODO:</b>{" "}
        {(Number(car.odo) * 10000).toLocaleString("vi-VN")} km
      </p>

      <p><b>Giá:</b> {car.price}</p>

      <p><b>Bảo hành:</b> {car.warranty}</p>

      <p><b>Pháp lý:</b> {car.legal}</p>

      <p><b>Trạng thái:</b> {car.status}</p>

      <hr />

<h3>🤖 AI Memory</h3>

<div className="ai-memory">

  <p>
    📘 Facebook:
    {ai.facebook ? " ✅ Đã tạo" : " ❌ Chưa có"}
    {ai.facebook && <button onClick={() => onViewAI("facebook")}>
  👁 Xem
</button>}
  </p>

  <p>
    🎬 TikTok:
    {ai.tiktok ? " ✅ Đã tạo" : " ❌ Chưa có"}
    {ai.tiktok && <button onClick={() => onViewAI("tiktok")}>
  👁 Xem
</button>}
  </p>

  <p>
    ▶️ YouTube:
    {ai.youtube ? " ✅ Đã tạo" : " ❌ Chưa có"}
    {ai.youtube && <button onClick={() => onViewAI("youtube")}>
  👁 Xem
</button>}
  </p>

  <p>
    🌐 SEO:
    {ai.seo ? " ✅ Đã tạo" : " ❌ Chưa có"}
    {ai.seo && <button onClick={() => onViewAI("seo")}>
  👁 Xem
</button>}
  </p>

  <p>
    🖼 Thumbnail:
    {ai.thumbnail ? " ✅ Đã tạo" : " ❌ Chưa có"}
    {ai.thumbnail && <button onClick={() => onViewAI("thumbnail")}>
  👁 Xem
</button>}
  </p>

</div>

    </section>
  );
}

export default CarInfo;