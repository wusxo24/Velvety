import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "@/utils/axiosInstance";  
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const PaySuccess = () => {
    const { orderCode } = useParams();  // Lấy mã đơn hàng từ URL
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

    if (loading) return <div className="text-center mt-6">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-6">{error}</div>;

    return (
        <div className="bg-[#dde8f8] pt-10 pb-10 h-screen">
            <div className="max-w-md mx-auto bg-white p-6 shadow-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-600">Payment Successful</h2>
                    <p className="text-gray-500">Thank you for your purchase!</p>
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
                    <p className="text-sm text-gray-700 font-bold">Address: {order.buyerAddress}</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Order Summary</p>
                    <p className="text-sm font-bold">Description: {order.description}</p>
                    <p className="text-sm font-bold">Payment Method: {order.paymentMethod}</p>
                    <p className="text-sm font-bold">Status: <span className="text-green-500">{order.paymentStatus}</span></p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Amount Paid</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {order.amount} {order.currency}
                    </p>
                </div>

                <div className="flex justify-between mt-10">
                    <Link to={"/about"} className="text-blue-600"><ArrowBackIcon /> Back</Link>
                    <Link to={`/servicesHistory/${order.memberId}`} className="text-blue-600">Order History <ArrowForwardIcon /></Link>
                </div>
            </div>
        </div>
    );
};
