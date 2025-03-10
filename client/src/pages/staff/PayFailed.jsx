import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "@/utils/axiosInstance";  

export const PayFailed = () => {
    const orderCode = sessionStorage.getItem("orderCode") || localStorage.getItem("orderCode");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${orderCode}`);  // Gọi API lấy thông tin đơn hàng
                setOrder(response.data);
            } catch (error) {
                setError("Failed to fetch order details.");
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderCode]);

    if (loading) return <div className="text-center mt-6 h-screen">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-6">{error}</div>;

    return (
        <div className="bg-[#fdecea] pt-10 pb-10 h-screen">
            <div className="max-w-md mx-auto bg-white p-6 shadow-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
                    <p className="text-gray-500">Please try again later.</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Receipt</p>
                    <p className="text-sm text-gray-500">Order ID: <span className="font-mono">{order.orderCode}</span></p>
                    <p className="text-sm text-gray-500">Transaction Date: {new Date(order.transactionDateTime).toLocaleString()}</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Buyer Details</p>
                    <p className="text-sm text-gray-700 font-bold">Name: {order.buyerName}</p>
                    <p className="text-sm text-gray-700 font-bold">Email: {order.buyerEmail}</p>
                    <p className="text-sm text-gray-700 font-bold">Phone: {order.buyerPhone}</p>
                </div>

                <div className="flex justify-center mt-10">
                    <Link to={"/about"} className="text-blue-600">Return Home</Link>
                </div>
            </div>
        </div>
    );
};
