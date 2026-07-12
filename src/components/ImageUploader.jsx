import { useRef } from "react";

function ImageUploader({ images = [], setImages }) {
  const fileInputRef = useRef(null);

  function handleSelectFiles(e) {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setImages([...images, ...newImages]);
  }

  function handleRemove(id) {
    setImages(images.filter((img) => img.id !== id));
  }

  return (
    <div className="form-group">
      <label>📷 Hình ảnh xe</label>

      <button
        type="button"
        className="add-btn"
        onClick={() => fileInputRef.current.click()}
      >
        ➕ Chọn ảnh
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleSelectFiles}
      />
            <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        {images.map((img) => (
          <div
            key={img.id}
            style={{
              position: "relative",
            }}
          >
            <img
              src={img.preview}
              alt=""
              style={{
                width: "120px",
                height: "90px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />

            <button
              type="button"
              onClick={() => handleRemove(img.id)}
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                border: "none",
                background: "red",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
               ))}
      </div>

    </div>
  );
}

export default ImageUploader;