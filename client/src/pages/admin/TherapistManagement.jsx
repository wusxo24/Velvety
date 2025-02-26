import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/AdminSidebar";

export default function TherapistManagement() {
  const [therapists, setTherapists] = useState([]);
  const [newTherapist, setNewTherapist] = useState({ username: "", name: "", email: "", phone: "" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    // Lấy tất cả người dùng và lọc theo role là "Therapist"
    axios.get("/api/users")
      .then((res) => {
        const filteredTherapists = res.data.filter(user => user.roleName === "Therapist");
        setTherapists(filteredTherapists);
      })
      .catch((err) => console.error("Error fetching therapists:", err));
  }, []);

  // Hàm xóa therapist
  const handleDelete = (id) => {
    axios.delete(`/api/users/${id}`)
      .then(() => setTherapists(therapists.filter(therapist => therapist._id !== id)))
      .catch((err) => console.error("Error deleting therapist:", err));
  };

  // Hàm cập nhật thông tin therapist
  const handleUpdate = (therapist) => {
    const newName = prompt("Nhập tên mới:", therapist.name);
    const newEmail = prompt("Nhập email mới:", therapist.email);
    const newPhone = prompt("Nhập số điện thoại mới:", therapist.phone);

    if (newName && newEmail && newPhone) {
      axios.put(`/api/users/${therapist._id}`, {
        name: newName,
        email: newEmail,
        phone: newPhone,
      })
      .then((res) => {
        setTherapists(therapists.map((t) => (t._id === therapist._id ? res.data : t)));
      })
      .catch((err) => console.error("Error updating therapist:", err));
    }
  };

  // Hàm thêm therapist mới
  const handleAdd = () => {
    if (newTherapist.username && newTherapist.name && newTherapist.email && newTherapist.phone) {
      axios.post("/api/users", newTherapist)
        .then((res) => {
          setTherapists([...therapists, res.data]);
          setNewTherapist({ username: "", name: "", email: "", phone: "" });
          setIsAddModalOpen(false); // Đóng modal sau khi thêm
        })
        .catch((err) => console.error("Error adding therapist:", err));
    } else {
      alert("Vui lòng nhập đầy đủ thông tin!");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-white">
        <h2 className="text-2xl font-bold mb-4">Therapist Management</h2>

        {/* Nút thêm nhân viên */}
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Therapist
        </button>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-green-300">
              <th className="border p-2">ID</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {therapists.map((therapist) => (
              <tr key={therapist._id} className="text-center border-b">
                <td className="border p-2">{therapist._id}</td>
                <td className="border p-2">{therapist.username}</td>
                <td className="border p-2">{therapist.name}</td>
                <td className="border p-2">{therapist.email}</td>
                <td className="border p-2">{therapist.phone}</td>
                <td className="border p-2">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded mr-2 hover:bg-red-700"
                    onClick={() => handleDelete(therapist._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => handleUpdate(therapist)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal thêm nhân viên */}
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h2 className="text-xl font-bold mb-4">Add Therapist</h2>
              <input
                type="text"
                value={newTherapist.username}
                onChange={(e) => setNewTherapist({ ...newTherapist, username: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                placeholder="Username"
              />
              <input
                type="text"
                value={newTherapist.name}
                onChange={(e) => setNewTherapist({ ...newTherapist, name: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                placeholder="Name"
              />
              <input
                type="email"
                value={newTherapist.email}
                onChange={(e) => setNewTherapist({ ...newTherapist, email: e.target.value })}
                className="w-full p-2 border rounded mb-2"
                placeholder="Email"
              />
              <input
                type="text"
                value={newTherapist.phone}
                onChange={(e) => setNewTherapist({ ...newTherapist, phone: e.target.value })}
                className="w-full p-2 border rounded mb-4"
                placeholder="Phone"
              />
              <div className="flex justify-end">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-700"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={handleAdd}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
