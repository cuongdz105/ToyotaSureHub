import { useEffect, useState } from "react";

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

    refreshGroups();
  }

  function handleEdit(group) {

    alert("Sprint tiếp theo sẽ làm chức năng Sửa.");

    console.log(group);

  }

  return (
    <div className="content">

      <h1>👥 Facebook Groups</h1>

      <p>Quản lý thư viện hội nhóm Facebook.</p>

      {postingCar && (

    <SectionCard title="🚗 Đang bán">

        <h3>
            {postingCar.brand} {postingCar.model}
        </h3>

        <p>
            {postingCar.version}
        </p>

        <p>
            {postingCar.year}
        </p>

    </SectionCard>

)}

      <SectionCard title="➕ Thêm hội nhóm">

        <TextInput
          placeholder="Tên hội nhóm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br />
        <br />

        <TextInput
          placeholder="Link Facebook Group"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <br />
        <br />

        <PrimaryButton onClick={handleAddGroup}>
          ➕ Thêm nhóm
        </PrimaryButton>

      </SectionCard>

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