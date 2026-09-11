import express from "express";

import userRoutes from "./routes/user.routes.js";
import groupRoutes from "./routes/group.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import expenseItemRoutes from "./routes/expenseItem.routes.js";
import expenseSplitRoutes from "./routes/expenseSplit.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import balanceRoutes from "./routes/balance.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import settingsRoutes from "./routes/userSettings.routes.js";

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ========================================
// API ROUTES
// ========================================

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/expense-items", expenseItemRoutes);
app.use("/api/splits", expenseSplitRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/balances", balanceRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/settings", settingsRoutes);


// ========================================
// HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Expense Tracker API Running 🚀",
  });
});


export default app;