import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionCard from "../../components/Common/SectionCard";
import PrimaryButton from "../../components/Common/PrimaryButton";

import { getCurrentPosting } from "../../services/postingSessionService";

import {
  addToPostingQueue,
} from "../../services/facebookPostingQueueService";

import {
    loadAccounts,
    getDefaultAccount,
} from "../../services/facebookAccountService";

function FacebookPostPreview() {
  const navigate = useNavigate();

  const [postingCar, setPostingCar] = useState(null);
const [group, setGroup] = useState(null);
const [content, setContent] = useState("");
const [addingToQueue, setAddingToQueue] = useState(false);

const [accounts, setAccounts] = useState([]);
const [selectedAccountId, setSelectedAccountId] =
    useState("");

  useEffect(() => {
    const car = getCurrentPosting();

    setPostingCar(car);

    const savedAccounts = loadAccounts();

setAccounts(savedAccounts);

const defaultAccount =
    getDefaultAccount();

if (defaultAccount) {
    setSelectedAccountId(
        String(defaultAccount.id)
    );
} else if (savedAccounts.length > 0) {
    setSelectedAccountId(
        String(savedAccounts[0].id)
    );
}

    const savedGroup = sessionStorage.getItem(
      "toyota_sure_selected_group"
    );

    if (savedGroup) {
      try {
        setGroup(JSON.parse(savedGroup));
      } catch (error) {
        console.error(
          "Không đọc được nhóm Facebook:",
          error
        );
      }
    }

    if (car?.aiContent?.facebook) {
      setContent(car.aiContent.facebook);
    }
  }, []);

  if (!postingCar) {
    return (
      <main className="content">
        <h1>🚀 Facebook Posting</h1>

        <SectionCard title="⚠️ Chưa có xe">
          <p>
            Chưa có chiếc xe nào được chọn để đăng.
          </p>

          <PrimaryButton
            onClick={() => navigate("/cars")}
          >
            🚗 Quay lại danh sách xe
          </PrimaryButton>
        </SectionCard>
      </main>
    );
  }

  const images = Array.isArray(postingCar.images)
    ? postingCar.images
    : [];

  function getImageSrc(image) {
    if (typeof image === "string") {
      return image;
    }

    return image?.preview || "";
  }

  function handleAddToQueue() {
    if (!group) {
      alert("⚠️ Chưa chọn hội nhóm.");
      return;
    }

    if (!selectedAccountId) {
    alert(
        "⚠️ Chưa chọn tài khoản Facebook."
    );
    return;
}

    if (images.length === 0) {
      alert("⚠️ Xe chưa có ảnh.");
      return;
    }

    if (!content.trim()) {
      alert("⚠️ Chưa có nội dung Facebook.");
      return;
    }

    try {
      setAddingToQueue(true);

      const job = addToPostingQueue({
  carId: postingCar.id,
  group,
  content,
  imageCount: images.length,
  accountId: Number(selectedAccountId),
});

      console.log(
        "✅ Facebook Queue Job:",
        job
      );

const selectedAccount =
    accounts.find(
        (account) =>
            String(account.id) ===
            String(selectedAccountId)
    );

      alert(
    "✅ Đã thêm bài đăng vào Queue!\n\n" +
    `Xe: ${postingCar.brand} ${postingCar.model}\n` +
    `Tài khoản: ${
        selectedAccount?.name || "Không rõ"
    }\n` +
    `Nhóm: ${group.name}\n` +
    `Ảnh: ${images.length}`
);

      navigate("/facebook/queue");
    } catch (error) {
      console.error(
        "Lỗi thêm vào Facebook Queue:",
        error
      );

      alert(
        "❌ Không thể thêm vào Queue:\n" +
        error.message
      );
    } finally {
      setAddingToQueue(false);
    }
  }

  return (
    <main className="content">
      <h1>🚀 Facebook Posting</h1>

      <SectionCard title="🚗 Xe đang đăng">
        <h2>
          {postingCar.brand}{" "}
          {postingCar.model}
        </h2>

        <p>
          {postingCar.version} ·{" "}
          {postingCar.year}
        </p>
      </SectionCard>

      {group && (
        <SectionCard title="👥 Nhóm đăng">
          <h2>{group.name}</h2>

          <p>
            ⭐ Độ phù hợp:{" "}
            <strong>
              {group.matchScore || 0}%
            </strong>
          </p>

          {group.url && (
            <PrimaryButton
              onClick={() =>
                window.open(
                  group.url,
                  "_blank"
                )
              }
            >
              🌐 Mở nhóm
            </PrimaryButton>
          )}
        </SectionCard>

      )}

      <SectionCard title="👤 Tài khoản Facebook đăng">
    {accounts.length === 0 ? (
        <div>
            <p>
                ⚠️ Chưa có tài khoản Facebook nào.
            </p>

            <PrimaryButton
                onClick={() =>
                    navigate(
                        "/facebook/accounts"
                    )
                }
            >
                👤 Quản lý tài khoản Facebook
            </PrimaryButton>
        </div>
    ) : (
        <div
            style={{
                maxWidth: "700px",
            }}
        >
            <label
                style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                }}
            >
                Chọn tài khoản sẽ dùng để đăng:
            </label>

            <select
                value={selectedAccountId}
                onChange={(e) =>
                    setSelectedAccountId(
                        e.target.value
                    )
                }
                style={{
                    width: "100%",
                    padding: "12px",
                    border:
                        "1px solid #ccc",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing:
                        "border-box",
                    background: "#fff",
                }}
            >
                <option value="">
                    -- Chọn tài khoản Facebook --
                </option>

                {accounts.map(
                    (account) => (
                        <option
                            key={account.id}
                            value={account.id}
                        >
                            {account.name}
                            {account.isDefault
                                ? " ⭐ Mặc định"
                                : ""}
                        </option>
                    )
                )}
            </select>

            {selectedAccountId && (
                <div
                    style={{
                        marginTop: "12px",
                        padding: "12px",
                        background:
                            "#f5f5f5",
                        borderRadius: "8px",
                    }}
                >
                    {(() => {
                        const account =
                            accounts.find(
                                (item) =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        selectedAccountId
                                    )
                            );

                        if (!account) {
                            return null;
                        }

                        return (
                            <>
                                <div>
                                    👤{" "}
                                    <strong>
                                        {
                                            account.name
                                        }
                                    </strong>
                                </div>

                                <div>
                                    🟢 Trạng thái:{" "}
                                    {
                                        account.status
                                    }
                                </div>

                                {account.note && (
                                    <div>
                                        📝 Ghi chú:{" "}
                                        {
                                            account.note
                                        }
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    )}
</SectionCard>

      <SectionCard title="📷 Ảnh xe">
        {images.length === 0 ? (
          <p>
            ⚠️ Xe này chưa có ảnh.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "12px",
            }}
          >
            {images.map(
              (image, index) => {
                const src =
                  getImageSrc(image);

                return (
                  <div
                    key={index}
                    style={{
                      border:
                        "1px solid #ddd",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    <img
                      src={src}
                      alt={`Ảnh xe ${
                        index + 1
                      }`}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                );
              }
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard title="📝 Nội dung Facebook">
        <textarea
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          style={{
            width: "100%",
            minHeight: "300px",
            padding: "15px",
            fontSize: "16px",
            lineHeight: "1.6",
            boxSizing: "border-box",
            borderRadius: "10px",
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />
      </SectionCard>

      <SectionCard title="🚀 Sẵn sàng đăng">
        <p>
<p>
    👤 Tài khoản:{" "}
    <strong>
        {accounts.find(
            (account) =>
                String(account.id) ===
                String(selectedAccountId)
        )?.name ||
            "Chưa chọn tài khoản"}
    </strong>
</p>

          👥 Nhóm:{" "}
          <strong>
            {group?.name ||
              "Chưa chọn nhóm"}
          </strong>
        </p>

        <p>
          📷 Số ảnh:{" "}
          <strong>
            {images.length}
          </strong>
        </p>

        <p>
          📝 Nội dung:{" "}
          <strong>
            {content.trim()
              ? "Đã có"
              : "Chưa có"}
          </strong>
        </p>

        <br />

        <PrimaryButton
          onClick={handleAddToQueue}
          disabled={addingToQueue}
        >
          {addingToQueue
            ? "⏳ Đang thêm vào Queue..."
            : "➕ THÊM VÀO QUEUE"}
        </PrimaryButton>

        <div
          style={{
            marginTop: "12px",
            color: "#666",
            fontSize: "14px",
          }}
        >
          💡 Bài đăng sẽ được đưa vào hàng
          đợi. Chưa đăng Facebook thật ở
          bước này.
        </div>
      </SectionCard>
    </main>
  );
}

export default FacebookPostPreview;