import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loadGroups,
  addGroup,
  updateGroup,
  deleteGroup,
} from "../../services/facebookGroupService";

import {
  loadAccounts,
} from "../../services/facebookAccountService";

import PrimaryButton from "../../components/Common/PrimaryButton";
import TextInput from "../../components/Common/TextInput";
import SectionCard from "../../components/Common/SectionCard";
import EmptyState from "../../components/Common/EmptyState";

import FacebookGroupCard from "../../components/Facebook/FacebookGroupCard";

import {
  getCurrentPosting,
} from "../../services/postingSessionService";

function FacebookGroups() {
  const [groups, setGroups] = useState([]);

  const [accounts, setAccounts] = useState([]);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const [search, setSearch] = useState("");

  const [selectedGroup, setSelectedGroup] =
    useState(null);

  /*
   * Group đang mở phần quản lý Account
   */
  const [managingAccountGroupId, setManagingAccountGroupId] =
    useState(null);

  /*
   * Các Account đang được tick
   * cho Group đang quản lý
   */
  const [selectedAccountIds, setSelectedAccountIds] =
    useState([]);

  const postingCar = getCurrentPosting();

  useEffect(() => {
    refreshData();
  }, []);

  /*
   * ==========================================
   * LOAD DATA
   * ==========================================
   */

  function refreshData() {
    setGroups(loadGroups());
    setAccounts(loadAccounts());
  }

  /*
   * ==========================================
   * THÊM GROUP
   * ==========================================
   */

  function handleAddGroup() {
    if (!name.trim()) {
      alert(
        "Vui lòng nhập tên hội nhóm."
      );

      return;
    }

    addGroup({
      name: name.trim(),
      url: url.trim(),
    });

    setName("");
    setUrl("");

    refreshData();
  }

  /*
   * ==========================================
   * XÓA GROUP
   * ==========================================
   */

  function handleDelete(id) {
    if (
      !window.confirm(
        "Xóa hội nhóm này?"
      )
    ) {
      return;
    }

    deleteGroup(id);

    if (selectedGroup?.id === id) {
      setSelectedGroup(null);
    }

    if (
      managingAccountGroupId === id
    ) {
      setManagingAccountGroupId(
        null
      );

      setSelectedAccountIds([]);
    }

    refreshData();
  }

  /*
   * ==========================================
   * EDIT GROUP
   * ==========================================
   */

  function handleEdit(group) {
    alert(
      "Sprint tiếp theo sẽ làm chức năng Sửa."
    );

    console.log(group);
  }

  /*
   * ==========================================
   * TÍNH ĐỘ PHÙ HỢP
   * ==========================================
   */

  function getGroupScore(group) {
    if (!postingCar) return 0;

    let score = 50;

    const suitableCars =
      Array.isArray(
        group.suitableCars
      )
        ? group.suitableCars
        : [];

    const suitableText =
      suitableCars
        .join(" ")
        .toLowerCase();

    /*
     * Nhóm phù hợp với dòng xe
     */
    if (
      postingCar.model &&
      suitableText.includes(
        postingCar.model.toLowerCase()
      )
    ) {
      score += 35;
    }

    /*
     * Tên nhóm có hãng / model
     */
    if (group.name) {
      const groupName =
        group.name.toLowerCase();

      if (
        postingCar.brand &&
        groupName.includes(
          postingCar.brand.toLowerCase()
        )
      ) {
        score += 10;
      }

      if (
        postingCar.model &&
        groupName.includes(
          postingCar.model.toLowerCase()
        )
      ) {
        score += 15;
      }
    }

    /*
     * Group đang active
     */
    if (
      group.status === "active"
    ) {
      score += 5;
    }

    /*
     * Chưa từng đăng
     */
    if (
      !group.totalPosts ||
      group.totalPosts === 0
    ) {
      score += 3;
    }

    return Math.min(
      score,
      100
    );
  }

  /*
   * ==========================================
   * NHÓM GỢI Ý
   * ==========================================
   */

  const recommendedGroups =
    useMemo(() => {
      return [...groups]
        .map((group) => ({
          ...group,

          matchScore:
            getGroupScore(group),
        }))
        .sort(
          (a, b) =>
            b.matchScore -
            a.matchScore
        )
        .slice(0, 5);
    }, [groups, postingCar]);

  /*
   * ==========================================
   * TÌM KIẾM GROUP
   * ==========================================
   */

  const searchedGroups =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return groups;
      }

      return groups.filter(
        (group) => {
          const nameMatch =
            group.name
              ?.toLowerCase()
              .includes(keyword);

          const urlMatch =
            group.url
              ?.toLowerCase()
              .includes(keyword);

          const suitableMatch =
            Array.isArray(
              group.suitableCars
            ) &&
            group.suitableCars.some(
              (car) =>
                car
                  .toLowerCase()
                  .includes(
                    keyword
                  )
            );

          return (
            nameMatch ||
            urlMatch ||
            suitableMatch
          );
        }
      );
    }, [groups, search]);

  /*
   * ==========================================
   * CHỌN GROUP ĐỂ ĐĂNG
   * ==========================================
   */

  function handleSelectGroup(group) {
    const groupWithScore = {
      ...group,

      matchScore:
        group.matchScore ||
        getGroupScore(group),
    };

    setSelectedGroup(
      groupWithScore
    );

    sessionStorage.setItem(
      "toyota_sure_selected_group",
      JSON.stringify(
        groupWithScore
      )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * ==========================================
   * MỞ QUẢN LÝ ACCOUNT CỦA GROUP
   * ==========================================
   */

  function handleOpenAccountManager(
    group
  ) {
    const accountIds =
      Array.isArray(
        group.accountIds
      )
        ? group.accountIds
        : [];

    setManagingAccountGroupId(
      group.id
    );

    /*
     * Luôn lưu ID dưới dạng String
     * để checkbox không bị lỗi
     * number/string.
     */
    setSelectedAccountIds(
      accountIds.map((id) =>
        String(id)
      )
    );
  }

  /*
   * ==========================================
   * TICK / BỎ TICK ACCOUNT
   * ==========================================
   */

  function handleToggleAccount(
    accountId
  ) {
    const id = String(
      accountId
    );

    setSelectedAccountIds(
      (current) => {
        if (
          current.includes(id)
        ) {
          return current.filter(
            (item) =>
              item !== id
          );
        }

        return [
          ...current,
          id,
        ];
      }
    );
  }

  /*
   * ==========================================
   * LƯU ACCOUNT CHO GROUP
   * ==========================================
   */

  function handleSaveAccounts(
    group
  ) {
    updateGroup(
      group.id,
      {
        accountIds:
          selectedAccountIds,
      }
    );

    setManagingAccountGroupId(
      null
    );

    setSelectedAccountIds([]);

    refreshData();

    /*
     * Nếu group này đang được chọn
     * thì cập nhật luôn sessionStorage.
     */
    if (
      selectedGroup?.id ===
      group.id
    ) {
      const updatedGroup = {
        ...group,

        accountIds:
          selectedAccountIds,
      };

      setSelectedGroup(
        updatedGroup
      );

      sessionStorage.setItem(
        "toyota_sure_selected_group",
        JSON.stringify(
          updatedGroup
        )
      );
    }

    alert(
      "✅ Đã lưu tài khoản Facebook cho nhóm."
    );
  }

  /*
   * ==========================================
   * ĐÓNG QUẢN LÝ ACCOUNT
   * ==========================================
   */

  function handleCancelAccountManager() {
    setManagingAccountGroupId(
      null
    );

    setSelectedAccountIds([]);
  }

  /*
   * ==========================================
   * LẤY TÊN ACCOUNT
   * ==========================================
   */

  function getAccountName(
    accountId
  ) {
    const account =
      accounts.find(
        (item) =>
          String(item.id) ===
          String(accountId)
      );

    return (
      account?.name ||
      "Tài khoản không tồn tại"
    );
  }

  /*
   * ==========================================
   * LẤY ACCOUNT CỦA GROUP
   * ==========================================
   */

  function getGroupAccounts(
    group
  ) {
    const accountIds =
      Array.isArray(
        group.accountIds
      )
        ? group.accountIds
        : [];

    return accountIds
      .map((id) =>
        accounts.find(
          (account) =>
            String(
              account.id
            ) ===
            String(id)
        )
      )
      .filter(Boolean);
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div className="content">

      <h1>
        👥 Facebook Posting Center
      </h1>

      <p>
        Chọn hội nhóm để đăng bài
        Facebook nhanh nhất.
      </p>

      {/* =====================================
          XE ĐANG ĐĂNG
      ====================================== */}

      {postingCar && (
        <SectionCard
          title="🚗 Đang đăng xe"
        >
          <h2>
            {postingCar.brand}{" "}
            {postingCar.model}
          </h2>

          <p>
            {postingCar.version} ·{" "}
            {postingCar.year}
          </p>
        </SectionCard>
      )}

      {/* =====================================
          NHÓM ĐÃ CHỌN
      ====================================== */}

      {selectedGroup && (
        <SectionCard
          title="🎯 Nhóm đã chọn"
        >
          <h2>
            👥{" "}
            {selectedGroup.name}
          </h2>

          <p>
            ⭐ Độ phù hợp:{" "}
            <strong>
              {
                selectedGroup.matchScore ||
                getGroupScore(
                  selectedGroup
                )
              }
              %
            </strong>
          </p>

          <p>
            👤 Tài khoản được phép:{" "}
            <strong>
              {
                getGroupAccounts(
                  selectedGroup
                ).length
              }
            </strong>
          </p>

          <PrimaryButton
            onClick={() =>
            (window.location.href =
              "/facebook/post")
            }
          >
            🚀 Tiếp tục đăng
          </PrimaryButton>
        </SectionCard>
      )}

      {/* =====================================
          GỢI Ý NHÓM
      ====================================== */}

      {postingCar &&
        groups.length > 0 && (
          <SectionCard
            title="🔥 Nhóm nên đăng"
          >
            <p>
              ToyotaSureHub tự gợi ý
              dựa trên độ phù hợp
              với chiếc xe đang bán.
            </p>

            {recommendedGroups.map(
              (group) => (
                <div
                  key={group.id}
                  style={{
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    padding: "15px",
                    marginBottom:
                      "12px",
                    background:
                      selectedGroup?.id ===
                        group.id
                        ? "#fff8e1"
                        : "#fff",
                  }}
                >
                  <h3>
                    👥{" "}
                    {group.name}
                  </h3>

                  <p>
                    ⭐ Độ phù hợp:{" "}
                    <strong>
                      {
                        group.matchScore
                      }
                      %
                    </strong>
                  </p>

                  <p>
                    📌 Đã đăng:{" "}
                    {
                      group.totalPosts ||
                      0
                    }
                  </p>

                  <p>
                    🟢 Trạng thái:{" "}
                    {
                      group.status ||
                      "active"
                    }
                  </p>

                  <p>
  👤 Tài khoản:{" "}
  <strong>
    {
      Array.isArray(group.accountIds)
        ? group.accountIds.length
        : 0
    }
  </strong>
</p>

                  <PrimaryButton
                    onClick={() =>
                      handleSelectGroup(
                        group
                      )
                    }
                  >
                    👉 Chọn đăng
                  </PrimaryButton>
                </div>
              )
            )}
          </SectionCard>
        )}

      {/* =====================================
          TÌM NHÓM
      ====================================== */}

      <SectionCard
        title="🔍 Tìm hội nhóm"
      >
        <TextInput
          placeholder="Nhập tên nhóm, dòng xe..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <br />
        <br />

        {search && (
          <p>
            Tìm thấy:{" "}
            <strong>
              {
                searchedGroups.length
              }
            </strong>{" "}
            nhóm
          </p>
        )}

        {search &&
          searchedGroups.map(
            (group) => (
              <div
                key={group.id}
                style={{
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  padding: "15px",
                  marginBottom:
                    "10px",
                }}
              >
                <h3>
                  👥{" "}
                  {group.name}
                </h3>

                <p>
                  ⭐ Độ phù hợp:{" "}
                  {
                    getGroupScore(
                      group
                    )
                  }
                  %
                </p>

                <PrimaryButton
                  onClick={() =>
                    handleSelectGroup(
                      {
                        ...group,
                        matchScore:
                          getGroupScore(
                            group
                          ),
                      }
                    )
                  }
                >
                  👉 Chọn nhóm này
                </PrimaryButton>
              </div>
            )
          )}
      </SectionCard>

      {/* =====================================
          THÊM NHÓM
      ====================================== */}

      <SectionCard
        title="➕ Thêm hội nhóm"
      >
        <TextInput
          placeholder="Tên hội nhóm"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <TextInput
          placeholder="Link Facebook Group"
          value={url}
          onChange={(e) =>
            setUrl(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <PrimaryButton
          onClick={handleAddGroup}
        >
          ➕ Thêm nhóm
        </PrimaryButton>
      </SectionCard>

      {/* =====================================
          THƯ VIỆN NHÓM
      ====================================== */}

      <SectionCard
        title="📚 Thư viện hội nhóm"
      >
        {groups.length === 0 ? (
          <EmptyState
            text="Chưa có hội nhóm."
          />
        ) : (
          groups.map(
            (group) => {
              const groupAccounts =
                getGroupAccounts(
                  group
                );

              const isManaging =
                managingAccountGroupId ===
                group.id;

              return (
                <div
                  key={group.id}
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >

                  {/* CARD CŨ */}

                  <FacebookGroupCard
                    group={group}
                    onEdit={
                      handleEdit
                    }
                    onDelete={
                      handleDelete
                    }
                  />

                  {/* ACCOUNT CỦA GROUP */}

                  <div
                    style={{
                      marginTop:
                        "8px",
                      padding:
                        "15px",
                      border:
                        "1px solid #ddd",
                      borderRadius:
                        "10px",
                      background:
                        "#fafafa",
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: "10px",
                        flexWrap:
                          "wrap",
                      }}
                    >

                      <div>
                        <strong>
                          👤 Tài khoản
                          Facebook
                        </strong>

                        <div
                          style={{
                            marginTop:
                              "6px",
                            color:
                              "#666",
                            fontSize:
                              "14px",
                          }}
                        >
                          {groupAccounts.length ===
                            0
                            ? "Chưa có tài khoản nào được phép đăng."
                            : groupAccounts
                              .map(
                                (
                                  account
                                ) =>
                                  account.name
                              )
                              .join(
                                " · "
                              )}
                        </div>
                      </div>

                      <PrimaryButton
                        onClick={() =>
                          handleOpenAccountManager(
                            group
                          )
                        }
                      >
                        👤 Quản lý tài khoản
                      </PrimaryButton>

                    </div>

                    {/* =========================
                        BẢNG CHỌN ACCOUNT
                    ========================== */}

                    {isManaging && (
                      <div
                        style={{
                          marginTop:
                            "15px",
                          padding:
                            "15px",
                          background:
                            "#fff8e1",
                          border:
                            "1px solid #f0c36d",
                          borderRadius:
                            "10px",
                        }}
                      >

                        <h3>
                          👤 Tài khoản được
                          phép đăng
                        </h3>

                        <p
                          style={{
                            color:
                              "#666",
                            fontSize:
                              "14px",
                          }}
                        >
                          Có thể chọn nhiều
                          tài khoản cho cùng
                          một nhóm.
                        </p>

                        {accounts.length ===
                          0 ? (
                          <div>
                            <p>
                              ⚠️ Chưa có
                              tài khoản
                              Facebook nào.
                            </p>

                            <PrimaryButton
                              onClick={() =>
                              (window.location.href =
                                "/facebook/accounts")
                              }
                            >
                              👤 Thêm tài khoản
                            </PrimaryButton>
                          </div>
                        ) : (
                          <>
                            {accounts.map(
                              (
                                account
                              ) => {
                                const checked =
                                  selectedAccountIds.includes(
                                    String(
                                      account.id
                                    )
                                  );

                                return (
                                  <label
                                    key={
                                      account.id
                                    }
                                    style={{
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      gap:
                                        "10px",
                                      padding:
                                        "10px",
                                      marginBottom:
                                        "6px",
                                      background:
                                        "#fff",
                                      borderRadius:
                                        "8px",
                                      cursor:
                                        "pointer",
                                    }}
                                  >

                                    <input
                                      type="checkbox"
                                      checked={
                                        checked
                                      }
                                      onChange={() =>
                                        handleToggleAccount(
                                          account.id
                                        )
                                      }
                                    />

                                    <span>
                                      👤{" "}
                                      <strong>
                                        {
                                          account.name
                                        }
                                      </strong>

                                      {account.isDefault && (
                                        <span
                                          style={{
                                            marginLeft:
                                              "8px",
                                            color:
                                              "#e31b23",
                                            fontSize:
                                              "13px",
                                          }}
                                        >
                                          ⭐ Mặc định
                                        </span>
                                      )}

                                      <span
                                        style={{
                                          marginLeft:
                                            "8px",
                                          color:
                                            account.status ===
                                              "active"
                                              ? "green"
                                              : "red",
                                          fontSize:
                                            "13px",
                                        }}
                                      >
                                        ●{" "}
                                        {
                                          account.status
                                        }
                                      </span>
                                    </span>

                                  </label>
                                );
                              }
                            )}

                            <div
                              style={{
                                marginTop:
                                  "12px",
                                display:
                                  "flex",
                                gap:
                                  "8px",
                                flexWrap:
                                  "wrap",
                              }}
                            >

                              <PrimaryButton
                                onClick={() =>
                                  handleSaveAccounts(
                                    group
                                  )
                                }
                              >
                                💾 Lưu tài khoản
                              </PrimaryButton>

                              <button
                                type="button"
                                onClick={
                                  handleCancelAccountManager
                                }
                                style={{
                                  padding:
                                    "10px 16px",
                                  border:
                                    "1px solid #ccc",
                                  borderRadius:
                                    "8px",
                                  background:
                                    "#fff",
                                  cursor:
                                    "pointer",
                                }}
                              >
                                Hủy
                              </button>

                            </div>
                          </>
                        )}

                      </div>
                    )}

                  </div>

                </div>
              );
            }
          )
        )}
      </SectionCard>

    </div>
  );
}

export default FacebookGroups;