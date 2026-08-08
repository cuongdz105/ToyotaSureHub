import { useEffect, useMemo, useState } from "react";

import {
  loadGroups,
  addGroup,
  deleteGroup,
} from "../../services/facebookGroupService";

import PrimaryButton from "../../components/Common/PrimaryButton";
import TextInput from "../../components/Common/TextInput";
import SectionCard from "../../components/Common/SectionCard";
import EmptyState from "../../components/Common/EmptyState";

import FacebookGroupCard from "../../components/Facebook/FacebookGroupCard";
import { getCurrentPosting } from "../../services/postingSessionService";

function FacebookGroups() {
  const [groups, setGroups] = useState([]);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);

  const postingCar = getCurrentPosting();

  useEffect(() => {
    refreshGroups();
  }, []);

  function refreshGroups() {
    setGroups(loadGroups());
  }

  function handleAddGroup() {
    if (!name.trim()) {
      alert("Vui lòng nhập tên hội nhóm.");
      return;
    }

    addGroup({
      name,
      url,
    });

    setName("");
    setUrl("");

    refreshGroups();
  }

  function handleDelete(id) {
    if (!window.confirm("Xóa hội nhóm này?")) {
      return;
    }

    deleteGroup(id);

    if (selectedGroup?.id === id) {
      setSelectedGroup(null);
    }

    refreshGroups();
  }

  function handleEdit(group) {
    alert("Sprint tiếp theo sẽ làm chức năng Sửa.");
    console.log(group);
  }

  /*
   * ==========================================
   * TÍNH ĐỘ PHÙ HỢP CỦA NHÓM
   * ==========================================
   */

  function getGroupScore(group) {
    if (!postingCar) return 0;

    let score = 50;

    const carText = `
      ${postingCar.brand || ""}
      ${postingCar.model || ""}
      ${postingCar.version || ""}
    `.toLowerCase();

    const suitableCars = Array.isArray(group.suitableCars)
      ? group.suitableCars
      : [];

    const suitableText = suitableCars.join(" ").toLowerCase();

    /*
     * Nhóm đã khai báo phù hợp với dòng xe
     */
    if (
      postingCar.model &&
      suitableText.includes(postingCar.model.toLowerCase())
    ) {
      score += 35;
    }

    /*
     * Tên nhóm có chứa tên hãng / model
     */
    if (group.name) {
      const groupName = group.name.toLowerCase();

      if (
        postingCar.brand &&
        groupName.includes(postingCar.brand.toLowerCase())
      ) {
        score += 10;
      }

      if (
        postingCar.model &&
        groupName.includes(postingCar.model.toLowerCase())
      ) {
        score += 15;
      }
    }

    /*
     * Nhóm đang active
     */
    if (group.status === "active") {
      score += 5;
    }

    /*
     * Nếu chưa từng đăng thì ưu tiên thử
     */
    if (!group.totalPosts || group.totalPosts === 0) {
      score += 3;
    }

    return Math.min(score, 100);
  }

  /*
   * ==========================================
   * NHÓM GỢI Ý
   * ==========================================
   */

  const recommendedGroups = useMemo(() => {
    return [...groups]
      .map((group) => ({
        ...group,
        matchScore: getGroupScore(group),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }, [groups, postingCar]);

  /*
   * ==========================================
   * TÌM KIẾM NHÓM - PA2
   * ==========================================
   */

  const searchedGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return groups;
    }

    return groups.filter((group) => {
      const nameMatch =
        group.name?.toLowerCase().includes(keyword);

      const urlMatch =
        group.url?.toLowerCase().includes(keyword);

      const suitableMatch =
        Array.isArray(group.suitableCars) &&
        group.suitableCars.some((car) =>
          car.toLowerCase().includes(keyword)
        );

      return nameMatch || urlMatch || suitableMatch;
    });
  }, [groups, search]);

  /*
   * ==========================================
   * CHỌN NHÓM
   * ==========================================
   */

  function handleSelectGroup(group) {
  setSelectedGroup(group);

  sessionStorage.setItem(
    "toyota_sure_selected_group",
    JSON.stringify(group)
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

  return (
    <div className="content">

      <h1>👥 Facebook Posting Center</h1>

      <p>
        Chọn hội nhóm để đăng bài Facebook nhanh nhất.
      </p>

      {/* =====================================
          XE ĐANG ĐĂNG
      ====================================== */}

      {postingCar && (
        <SectionCard title="🚗 Đang đăng xe">

          <h2>
            {postingCar.brand} {postingCar.model}
          </h2>

          <p>
            {postingCar.version} · {postingCar.year}
          </p>

        </SectionCard>
      )}

      {/* =====================================
          NHÓM ĐÃ CHỌN
      ====================================== */}

      {selectedGroup && (
        <SectionCard title="🎯 Nhóm đã chọn">

          <h2>
            👥 {selectedGroup.name}
          </h2>

          <p>
            ⭐ Độ phù hợp:
            {" "}
            <strong>
              {selectedGroup.matchScore || getGroupScore(selectedGroup)}%
            </strong>
          </p>

          <PrimaryButton
  onClick={() =>
    window.location.href = "/facebook/post"
  }
>
  🚀 Tiếp tục đăng
</PrimaryButton>

        </SectionCard>
      )}

      {/* =====================================
          GỢI Ý NHÓM
      ====================================== */}

      {postingCar && groups.length > 0 && (
        <SectionCard title="🔥 Nhóm nên đăng">

          <p>
            ToyotaSureHub tự gợi ý dựa trên độ phù hợp
            với chiếc xe đang bán.
          </p>

          {recommendedGroups.map((group) => (

            <div
              key={group.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "12px",
                background:
                  selectedGroup?.id === group.id
                    ? "#fff8e1"
                    : "#fff",
              }}
            >

              <h3>
                👥 {group.name}
              </h3>

              <p>
                ⭐ Độ phù hợp:
                {" "}
                <strong>
                  {group.matchScore}%
                </strong>
              </p>

              <p>
                📌 Đã đăng:
                {" "}
                {group.totalPosts || 0}
              </p>

              <p>
                🟢 Trạng thái:
                {" "}
                {group.status || "active"}
              </p>

              <PrimaryButton
                onClick={() =>
                  handleSelectGroup(group)
                }
              >
                👉 Chọn đăng
              </PrimaryButton>

            </div>

          ))}

        </SectionCard>
      )}

      {/* =====================================
          PA2 - TÌM NHÓM
      ====================================== */}

      <SectionCard title="🔍 Tìm hội nhóm">

        <TextInput
          placeholder="Nhập tên nhóm, dòng xe..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <br />
        <br />

        {search && (
          <p>
            Tìm thấy:
            {" "}
            <strong>
              {searchedGroups.length}
            </strong>
            {" "}
            nhóm
          </p>
        )}

        {search &&
          searchedGroups.map((group) => (

            <div
              key={group.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "10px",
              }}
            >

              <h3>
                👥 {group.name}
              </h3>

              <p>
                ⭐ Độ phù hợp:
                {" "}
                {getGroupScore(group)}%
              </p>

              <PrimaryButton
                onClick={() =>
                  handleSelectGroup({
                    ...group,
                    matchScore: getGroupScore(group),
                  })
                }
              >
                👉 Chọn nhóm này
              </PrimaryButton>

            </div>

          ))}

      </SectionCard>

      {/* =====================================
          THÊM NHÓM
      ====================================== */}

      <SectionCard title="➕ Thêm hội nhóm">

        <TextInput
          placeholder="Tên hội nhóm"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <br />
        <br />

        <TextInput
          placeholder="Link Facebook Group"
          value={url}
          onChange={(e) =>
            setUrl(e.target.value)
          }
        />

        <br />
        <br />

        <PrimaryButton onClick={handleAddGroup}>
          ➕ Thêm nhóm
        </PrimaryButton>

      </SectionCard>

      {/* =====================================
          THƯ VIỆN NHÓM
      ====================================== */}

      <SectionCard title="📚 Thư viện hội nhóm">

        {groups.length === 0 ? (

          <EmptyState
            text="Chưa có hội nhóm."
          />

        ) : (

          groups.map((group) => (

            <FacebookGroupCard
              key={group.id}
              group={group}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

          ))

        )}

      </SectionCard>

    </div>
  );
}

export default FacebookGroups;