import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import StaffSidebar from "../../components/StaffSidebar";
import { toast, ToastContainer } from "react-toastify";

const ViewBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [availableConsultants, setAvailableConsultants] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null); // booking hiện tại khi chưa có consultant

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("/api/booking-requests");
        console.log("Booking Response:", response);
        setBookings(response.data);
      } catch (err) {
        console.error("Error fetching bookings:", err.response ? err.response.data : err.message);
        setError(err.response ? err.response.data.message : err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);


  const handlePaymentClick = async (bookingId) => {
    try {
      const response = await axios.post(`/api/payments/create-payment/${bookingId}`);
      const checkoutUrl = response?.data?.data?.checkoutUrl; // Correct path
      const orderCode = response?.data?.data?.orderCode; // Check if orderCode exists
  
      if (!checkoutUrl) {
        throw new Error("checkoutUrl is missing from API response");
      }
  
      localStorage.setItem("orderCode", orderCode) && sessionStorage.setItem("orderCode", orderCode);
      localStorage.setItem("bookingId", bookingId) && sessionStorage.setItem("bookingId", bookingId);
      window.location.href = checkoutUrl;
      toast.success(`Successfully created payment link`);
    } catch (err) {
      console.error("Payment API Error:", err);
      setError(err.response?.data?.message || "Failed to create payment link");
      toast.error("Failed to create payment link. Please try again.");
    }
  };
  
  

  const handleConsultantClick = async (consultantID, bookingID) => {
    if (!bookingID) {
      console.error("Invalid booking ID:", bookingID);
      setError("Invalid booking ID");
      return;
    }
  
    if (consultantID) {
      try {
        const response = await axios.get(`/api/users/${consultantID}`);
        setSelectedConsultant(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch consultant details");
      }
    } else {
      try {
        console.log("Fetching available consultants for bookingID:", bookingID);
        const response = await axios.get(`/api/consultants/available?bookingID=${bookingID}`);
        setAvailableConsultants(response.data);
        setCurrentBooking(bookingID);
      } catch (err) {
        console.error("Error fetching available consultants:", err);
        setError(err.response?.data?.message || "Failed to fetch available consultants");
      }
    }
  };
  

  const closeConsultantModal = () => {
    setSelectedConsultant(null);
  };


  const assignConsultant = async (bookingId, consultantID) => {
    if (!consultantID) {
      console.error("Consultant ID is invalid:", consultantID);
      setError("Consultant ID is invalid");
      return;
    }
  
    try {
      await axios.put(`/api/bookings/assign-consultant`, { bookingID: bookingId, consultantID });
  
      // Cập nhật UI sau khi gán thành công
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, consultantID: { _id: consultantID, firstName: "Updated" } }
            : booking
        )
      );
      setAvailableConsultants([]);
    } catch (err) {
      console.error("Error assigning consultant:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to assign consultant");
    }
  };
  

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await axios.put(`/api/booking-requests/${id}/status`, { status: newStatus });
      // Cập nhật trạng thái ngay lập tức
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === id ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message);
    }
  };


  return (
    <div className="flex">
      <StaffSidebar />
      <div className="p-4 w-full">
      <ToastContainer/>
        <h1 className="text-2xl font-bold mb-4">View Bookings</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">Service Name</th>
              <th className="border p-2 text-center">Date</th>
              <th className="border p-2 text-center">Time</th>
              <th className="border p-2 text-center">Consultant</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center">Actions</th>
              <th className="border p-2 text-center">Payment</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border">
                <td className="border p-2 text-center">{booking.serviceID?.name || "Not Available"}</td>
                <td className="border p-2 text-center">{new Date(booking.date).toLocaleDateString()}</td>
                <td className="border p-2 text-center">{booking.time}</td>
                <td
                  className="border p-2 text-center cursor-pointer text-blue-500"
                  onClick={() => handleConsultantClick(booking.consultantID?._id, booking._id)}
                >
                  {booking.consultantID?.firstName || "Not Assigned"}
                </td>
                <td className="border p-2 text-center">
                  <span className={`p-1 rounded ${booking.status === "Pending" ? "bg-yellow-200" :
                    booking.status === "Confirmed" ? "bg-blue-200" :
                      booking.status === "Completed" ? "bg-green-200" : "bg-red-200"
                    }`}>{booking.status}</span>
                </td>
                <td className="border p-2 text-center">
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                    className="border p-1"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handlePaymentClick(booking._id)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
                  >
                    Use Payment
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>


        {/* Hiển thị chi tiết Consultant nếu đã có */}
        {selectedConsultant && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-800">Consultant Details</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closeConsultantModal}
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">First Name:</span>
                  <span className="text-gray-800">{selectedConsultant.firstName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Last Name:</span>
                  <span className="text-gray-800">{selectedConsultant.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="text-gray-800">{selectedConsultant.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="text-gray-800">{selectedConsultant.phoneNumber || "Not Available"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Role:</span>
                  <span className="text-gray-800">{selectedConsultant.roleName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Verified:</span>
                  <span className={`font-semibold ${selectedConsultant.verified ? "text-green-600" : "text-red-600"}`}>
                    {selectedConsultant.verified ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
              </div>
            </div>
          </div>
        )}

        {availableConsultants.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Select a Consultant</h3>
              
              {availableConsultants.map((consultant) => (
                <button
                  key={consultant._id}
                  className="w-full text-left p-2 border-b hover:bg-gray-100"
                  onClick={() => assignConsultant(currentBooking, consultant._id)}
                >
                  {consultant.firstName} {consultant.lastName}
                </button>
              ))}
        
              <button
                className="mt-4 w-full bg-gray-300 p-2 rounded text-center"
                onClick={() => setAvailableConsultants([])}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBooking;