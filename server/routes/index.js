const express = require("express");
const AuthRoutes = require("./AuthRoutes");
const UserRoutes = require("./UserRoutes");
const CustomerRoutes = require("./CustomerRoutes");
const StaffRoutes = require("./StaffRoutes");
const ManagerRoutes = require("./ManagerRoutes");
const ConsultantRoutes = require("./ConsultantRoutes");
const BookingRequestRoutes = require("./BookingRequestRoutes");
const FeedbackRoutes = require("./FeedbackRoutes");
const ServiceRoutes = require("./ServiceRoutes");
const QuizResultRoutes = require("./QuizResultRoutes");
const PaymentRoutes = require("./PaymentRoutes");
const BlogRoutes = require("./BlogRoutes");
const QuestionRoutes = require("./QuestionRoutes");
const CommentRoutes = require("./CommentRoutes");
const OrderRoutes = require("./OrderRoutes");

const router = express.Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/customers", CustomerRoutes);
router.use("/staff", StaffRoutes);
router.use("/managers", ManagerRoutes);
router.use("/consultants", ConsultantRoutes);
router.use("/booking-requests", BookingRequestRoutes);
router.use("/feedbacks", FeedbackRoutes);
router.use("/services", ServiceRoutes);
router.use("/quiz-results", QuizResultRoutes);
router.use("/payments", PaymentRoutes);
router.use("/blogs", BlogRoutes);
router.use("/questions", QuestionRoutes);
router.use("/comments", CommentRoutes);
router.use("/orders", OrderRoutes);


module.exports = router;
