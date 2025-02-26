import React, { useEffect, useState } from "react";
import StaffSidebar from "../../components/StaffSidebar";

const ViewBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [therapistDetails, setTherapistDetails] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/booking-requests"); // Thay đổi URL theo backend của bạn
        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.status}`);
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleTherapistClick = async (therapistID) => {
    try {
      const response = await fetch(`/api/users/${therapistID}`);
      if (!response.ok) {
        throw new Error("Failed to fetch therapist details");
      }
      const data = await response.json();
      setTherapistDetails(data);
      setSelectedTherapist(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex">
      <StaffSidebar />
      <div className="p-4 w-full">
        <h1 className="text-2xl font-bold mb-4">View Bookings</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">Service ID</th>
              <th className="border p-2 text-center">Date</th>
              <th className="border p-2 text-center">Time</th>
              <th className="border p-2 text-center">Therapist</th>
              <th className="border p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((BookingRequest) => (
              <tr key={BookingRequest._id} className="border">
                <td className="border p-2 text-center">{BookingRequest.serviceID}</td>
                <td className="border p-2 text-center">{new Date(BookingRequest.date).toLocaleDateString()}</td>
                <td className="border p-2 text-center">{BookingRequest.time}</td>
                <td
                  className="border p-2 text-center cursor-pointer text-blue-500"
                  onClick={() => handleTherapistClick(BookingRequest.therapistID)}
                >
                  {BookingRequest.therapistID || "Not Assigned"}
                </td>
                <td className="border p-2 text-center">{BookingRequest.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedTherapist && therapistDetails && (
          <div className="mt-4 p-4 border border-gray-300">
            <h3 className="text-xl font-semibold">Therapist Details</h3>
            <p><strong>First Name:</strong> {therapistDetails.firstName}</p>
            <p><strong>Last Name:</strong> {therapistDetails.lastName}</p>
            <p><strong>Email:</strong> {therapistDetails.email}</p>
            <p><strong>Phone Number:</strong> {therapistDetails.phoneNumber || "Not Available"}</p>
            <p><strong>Role:</strong> {therapistDetails.roleName}</p>
            <p><strong>Verified:</strong> {therapistDetails.verified ? "Yes" : "No"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBooking;
