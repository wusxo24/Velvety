import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "@/utils/axiosInstance";  
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const PaySuccess = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const orderCode = sessionStorage.getItem("orderCode") || localStorage.getItem("orderCode");
    const bookingId = sessionStorage.getItem("bookingId") || localStorage.getItem("bookingId");

    useEffect(() => {
        if (!orderCode) {
            setError("Order not found.");
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${orderCode}`);
                setOrder(response.data);
                
                // Update booking status **only if** bookingId exists
                if (bookingId) {
                    await updateBookingStatus();
                }
            } catch (error) {
                setError(error.response?.data?.message || "Failed to fetch order details.");
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderCode]); // bookingId is used only inside, no need to add in dependencies

    const updateBookingStatus = async () => {
        if (!bookingId) return;
    
        try {
            await axios.put(`/api/booking-requests/${bookingId}/status`, { status: "Completed" });
            console.log("Booking status updated successfully");
        } catch (error) {
            console.error("Error updating booking status:", error.response?.data?.message || error.message);
        }
    };
    
    

    if (loading) return <div className="text-center mt-6">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-6">{error}</div>;

    return (
        <div className="bg-[#dde8f8] min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-6 shadow-lg rounded-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-600">Payment Successful</h2>
                    <p className="text-gray-500">Thank you for your purchase!</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Receipt</p>
                    <p className="text-sm text-gray-500">Order ID: <span className="font-mono">{order?.orderCode}</span></p>
                    <p className="text-sm text-gray-500">
                        Transaction Date: {order?.transactionDateTime ? new Date(order.transactionDateTime).toLocaleString() : "N/A"}
                    </p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Buyer Details</p>
                    <p className="text-sm text-gray-700 font-bold">Name: {order?.buyerName || "N/A"}</p>
                    <p className="text-sm text-gray-700 font-bold">Email: {order?.buyerEmail || "N/A"}</p>
                    <p className="text-sm text-gray-700 font-bold">Phone: {order?.buyerPhone || "N/A"}</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Order Summary</p>
                    <p className="text-sm font-bold">Description: {order?.description || "N/A"}</p>
                    <p className="text-sm font-bold">Payment Method: {order?.paymentMethod || "N/A"}</p>
                    <p className="text-sm font-bold">Status: {order?.status || "N/A"}</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Amount Paid</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {order?.amount ? `${order.amount} ${order.currency}` : "N/A"}
                    </p>
                </div>

                <div className="flex justify-between mt-6">
                    <Link to={"/"} className="text-blue-600 flex items-center">
                        <ArrowBackIcon className="mr-1" /> Back
                    </Link>
                </div>
            </div>
        </div>
    );
};
