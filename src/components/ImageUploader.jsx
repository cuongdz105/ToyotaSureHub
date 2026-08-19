import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";

function ImageUploader({
  images = [],
  setImages,
}) {
  const fileInputRef = useRef(null);

  const [processing, setProcessing] =
    useState(false);

  const [progress, setProgress] =
    useState({
      current: 0,
      total: 0,
    });

  async function compressImage(file) {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.82,
    };

    const compressedFile =
      await imageCompression(
        file,
        options
      );

    return {
      id: crypto.randomUUID(),

      // Preview dùng Object URL, không tạo base64.
      preview:
        URL.createObjectURL(
          compressedFile
        ),

      // Giữ Blob để service upload trực tiếp.
      file: compressedFile,

      name: file.name,
      size: compressedFile.size,
      mimeType: compressedFile.type,
    };
  }

  async function handleSelectFiles(e) {
    const files =
      Array.from(
        e.target.files || []
      );

    if (files.length === 0) {
      return;
    }

    try {
      setProcessing(true);

      setProgress({
        current: 0,
        total: files.length,
      });

      const newImages =
        await Promise.all(
          files.map(
            async (file, index) => {
              const result =
                await compressImage(
                  file
                );

              setProgress(
                (prev) => ({
                  ...prev,
                  current: Math.max(
                    prev.current,
                    index + 1
                  ),
                })
              );

              return result;
            }
          )
        );

      setImages([
        ...images,
        ...newImages,
      ]);

    } catch (error) {
      console.error(
        "Image compression error:",
        error
      );

      alert(
        "❌ Không thể xử lý một hoặc nhiều ảnh."
      );

    } finally {
      setProcessing(false);

      setProgress({
        current: 0,
        total: 0,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  function handleRemove(id) {
    const target =
      images.find(
        (img) => img.id === id
      );

    if (
      target?.preview?.startsWith?.(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        target.preview
      );
    }

    setImages(
      images.filter(
        (img) => img.id !== id
      )
    );
  }

  function handleSetCover(id) {
    const selected =
      images.find(
        (img) => img.id === id
      );

    if (!selected) {
      return;
    }

    const others =
      images.filter(
        (img) => img.id !== id
      );

    setImages([
      selected,
      ...others,
    ]);
  }

  // Chỉ dọn Object URL khi component
  // thực sự bị unmount.
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (
          img?.preview?.startsWith?.(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            img.preview
          );
        }
      });
    };
  }, []);

  return (
    <div className="form-group">

      <label>
        📷 Hình ảnh xe
      </label>

      <button
        type="button"
        className="add-btn"
        onClick={() =>
          fileInputRef.current?.click()
        }
        disabled={processing}
        style={{
          opacity:
            processing ? 0.6 : 1,

          cursor:
            processing
              ? "not-allowed"
              : "pointer",
        }}
      >
        {processing
          ? "⏳ Đang xử lý ảnh..."
          : "➕ Chọn ảnh"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{
          display: "none",
        }}
        onChange={
          handleSelectFiles
        }
      />

      {processing && (
        <div
          style={{
            marginTop: "10px",
            color: "#666",
            fontSize: "13px",
          }}
        >
          🖼️ Đang tối ưu ảnh{" "}
          {progress.current}/
          {progress.total}...
        </div>
      )}

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
              loading="lazy"
              decoding="async"
              style={{
                width: "120px",
                height: "90px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />

            <div
              style={{
                marginTop: "6px",
                textAlign: "center",
              }}
            >
              {images[0]?.id ===
              img.id ? (
                <span
                  style={{
                    color: "#16a34a",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  ⭐ Ảnh bìa
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleSetCover(
                      img.id
                    )
                  }
                  style={{
                    fontSize: "12px",
                    border: "none",
                    background:
                      "transparent",
                    color: "#2563eb",
                    cursor: "pointer",
                  }}
                >
                  Đặt làm ảnh bìa
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                handleRemove(
                  img.id
                )
              }
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