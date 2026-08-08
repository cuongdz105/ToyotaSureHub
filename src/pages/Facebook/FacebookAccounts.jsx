import { useEffect, useState } from "react";

import SectionCard from "../../components/Common/SectionCard";
import PrimaryButton from "../../components/Common/PrimaryButton";

import {
    loadAccounts,
    addAccount,
    deleteAccount,
    setDefaultAccount,
} from "../../services/facebookAccountService";

function FacebookAccounts() {
    const [accounts, setAccounts] = useState([]);

    const [name, setName] = useState("");
    const [profileUrl, setProfileUrl] =
        useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        refreshAccounts();
    }, []);

    function refreshAccounts() {
        setAccounts(loadAccounts());
    }

    function handleAddAccount() {
        if (!name.trim()) {
            alert(
                "⚠️ Vui lòng nhập tên tài khoản."
            );
            return;
        }

        addAccount({
            name: name.trim(),
            profileUrl:
                profileUrl.trim(),
            note: note.trim(),
        });

        setName("");
        setProfileUrl("");
        setNote("");

        refreshAccounts();

        alert(
            "✅ Đã thêm tài khoản Facebook."
        );
    }

    function handleSetDefault(id) {
        setDefaultAccount(id);

        refreshAccounts();

        alert(
            "⭐ Đã đặt tài khoản làm mặc định."
        );
    }

    function handleDelete(id, accountName) {
        const confirmed =
            window.confirm(
                `Xóa tài khoản "${accountName}"?`
            );

        if (!confirmed) {
            return;
        }

        deleteAccount(id);

        refreshAccounts();
    }

    return (
        <main
            style={{
                padding: "24px",
                maxWidth: "1400px",
                margin: "0 auto",
            }}
        >
            <h1
                style={{
                    marginBottom: "6px",
                }}
            >
                👤 Facebook Accounts
            </h1>

            <p
                style={{
                    color: "#666",
                    marginTop: 0,
                }}
            >
                Quản lý các tài khoản Facebook
                dùng để đăng bài.
            </p>

            {/* =========================
                THÊM TÀI KHOẢN
            ========================= */}

            <SectionCard title="➕ Thêm tài khoản">
                <div
                    style={{
                        display: "grid",
                        gap: "14px",
                        maxWidth: "700px",
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontWeight: "600",
                                marginBottom: "6px",
                            }}
                        >
                            Tên tài khoản
                        </label>

                        <input
                            type="text"
                            placeholder="VD: Cương Toyota"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                boxSizing:
                                    "border-box",
                                padding: "11px",
                                border:
                                    "1px solid #ccc",
                                borderRadius:
                                    "8px",
                                fontSize: "15px",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: "block",
                                fontWeight: "600",
                                marginBottom: "6px",
                            }}
                        >
                            Link Facebook
                        </label>

                        <input
                            type="text"
                            placeholder="https://facebook.com/..."
                            value={profileUrl}
                            onChange={(e) =>
                                setProfileUrl(
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                boxSizing:
                                    "border-box",
                                padding: "11px",
                                border:
                                    "1px solid #ccc",
                                borderRadius:
                                    "8px",
                                fontSize: "15px",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: "block",
                                fontWeight: "600",
                                marginBottom: "6px",
                            }}
                        >
                            Ghi chú
                        </label>

                        <textarea
                            rows="3"
                            placeholder="VD: Tài khoản chính, chuyên đăng xe Toyota..."
                            value={note}
                            onChange={(e) =>
                                setNote(
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                boxSizing:
                                    "border-box",
                                padding: "11px",
                                border:
                                    "1px solid #ccc",
                                borderRadius:
                                    "8px",
                                fontSize: "15px",
                                resize: "vertical",
                            }}
                        />
                    </div>

                    <div>
                        <PrimaryButton
                            onClick={
                                handleAddAccount
                            }
                        >
                            💾 LƯU TÀI KHOẢN
                        </PrimaryButton>
                    </div>
                </div>
            </SectionCard>

            {/* =========================
                DANH SÁCH ACCOUNT
            ========================= */}

            <SectionCard title="📋 Danh sách tài khoản">
                {accounts.length === 0 ? (
                    <div
                        style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#777",
                        }}
                    >
                        👤 Chưa có tài khoản
                        Facebook nào.
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(320px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        {accounts.map(
                            (account) => (
                                <div
                                    key={
                                        account.id
                                    }
                                    style={{
                                        border:
                                            account.isDefault
                                                ? "2px solid #e11"
                                                : "1px solid #ddd",

                                        borderRadius:
                                            "12px",

                                        padding:
                                            "18px",

                                        background:
                                            "#fff",

                                        boxShadow:
                                            "0 2px 8px rgba(0,0,0,0.06)",
                                    }}
                                >
                                    {/* HEADER */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "flex-start",
                                            gap: "10px",
                                        }}
                                    >
                                        <div>
                                            <h3
                                                style={{
                                                    margin: 0,
                                                    marginBottom:
                                                        "6px",
                                                }}
                                            >
                                                👤{" "}
                                                {
                                                    account.name
                                                }
                                            </h3>

                                            {account.isDefault && (
                                                <span
                                                    style={{
                                                        display:
                                                            "inline-block",
                                                        background:
                                                            "#e11",
                                                        color:
                                                            "#fff",
                                                        padding:
                                                            "4px 9px",
                                                        borderRadius:
                                                            "20px",
                                                        fontSize:
                                                            "12px",
                                                        fontWeight:
                                                            "600",
                                                    }}
                                                >
                                                    ⭐ MẶC ĐỊNH
                                                </span>
                                            )}
                                        </div>

                                        <span
                                            style={{
                                                color:
                                                    account.status ===
                                                    "active"
                                                        ? "#0aaf50"
                                                        : "#999",

                                                fontWeight:
                                                    "600",
                                            }}
                                        >
                                            ●{" "}
                                            {account.status ===
                                            "active"
                                                ? "Hoạt động"
                                                : account.status}
                                        </span>
                                    </div>

                                    <hr />

                                    {/* THÔNG TIN */}

                                    <p>
                                        🔗{" "}
                                        <strong>
                                            Link:
                                        </strong>{" "}
                                        {account.profileUrl ||
                                            "Chưa có"}
                                    </p>

                                    <p>
                                        📝{" "}
                                        <strong>
                                            Ghi chú:
                                        </strong>{" "}
                                        {account.note ||
                                            "Không có"}
                                    </p>

                                    <p>
                                        👥{" "}
                                        <strong>
                                            Số nhóm:
                                        </strong>{" "}
                                        {Array.isArray(
                                            account.groups
                                        )
                                            ? account
                                                  .groups
                                                  .length
                                            : 0}
                                    </p>

                                    <p>
                                        📤{" "}
                                        <strong>
                                            Tổng bài:
                                        </strong>{" "}
                                        {account.totalPosts ||
                                            0}
                                    </p>

                                    {/* ACTIONS */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            gap: "8px",
                                            flexWrap:
                                                "wrap",
                                            marginTop:
                                                "16px",
                                        }}
                                    >
                                        {!account.isDefault && (
                                            <PrimaryButton
                                                onClick={() =>
                                                    handleSetDefault(
                                                        account.id
                                                    )
                                                }
                                            >
                                                ⭐ Đặt mặc định
                                            </PrimaryButton>
                                        )}

                                        <PrimaryButton
                                            onClick={() =>
                                                handleDelete(
                                                    account.id,
                                                    account.name
                                                )
                                            }
                                        >
                                            🗑️ Xóa
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </SectionCard>

            {/* =========================
                LƯU Ý
            ========================= */}

            <SectionCard title="💡 Lưu ý">
                <p>
                    Hệ thống hiện chỉ quản lý
                    thông tin tài khoản Facebook.
                </p>

                <p>
                    🔐 <strong>
                        Không lưu mật khẩu Facebook
                    </strong>{" "}
                    trong ToyotaSureHub.
                </p>

                <p>
                    🚀 Phần kết nối tài khoản để
                    đăng Facebook thật sẽ được
                    xây dựng ở bước Posting Engine
                    tiếp theo.
                </p>
            </SectionCard>
        </main>
    );
}

export default FacebookAccounts;