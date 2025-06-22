const Payment = require("../models/Payment");
const Order = require("../models/Order");

// Lấy danh sách thanh toán và đơn hàng theo tuần hoặc tháng
const getAnalysis = async (req, res) => {
  try {
    const { type = "month" } = req.query;
    res.status(201).json({
      payments: await aggregatePayments(type),
      orders: await aggregateOrders(type),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const aggregatePayments = async (type) => {
  const pipeline = [
    {
      $match: {
        status: "paid",
      },
    },
    {
      $addFields: {
        paidAtDate: { $toDate: "$paidAt" },
      },
    },
  ];

  if (type === "week") {
    pipeline.push(
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$paidAtDate" },
            week: { $isoWeek: "$paidAtDate" },
          },
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          week: "$_id.week",
          totalRevenue: 1,
          totalPayments: 1,
        },
      },
      {
        $sort: { year: 1, week: 1 },
      }
    );
  } else {
    pipeline.push(
      {
        $group: {
          _id: {
            year: { $year: "$paidAtDate" },
            month: { $month: "$paidAtDate" },
          },
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalRevenue: 1,
          totalPayments: 1,
        },
      },
      {
        $sort: { year: 1, month: 1 },
      }
    );
  }

  return await Payment.aggregate(pipeline);
};

const aggregateOrders = async (type) => {
  const pipeline = [
    {
      $addFields: {
        orderDateParsed: { $toDate: "$orderDate" },
      },
    },
  ];

  if (type === "week") {
    pipeline.push(
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$orderDateParsed" },
            week: { $isoWeek: "$orderDateParsed" },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          week: "$_id.week",
          totalOrders: 1,
        },
      },
      {
        $sort: { year: 1, week: 1 },
      }
    );
  } else {
    pipeline.push(
      {
        $group: {
          _id: {
            year: { $year: "$orderDateParsed" },
            month: { $month: "$orderDateParsed" },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalOrders: 1,
        },
      },
      {
        $sort: { year: 1, month: 1 },
      }
    );
  }

  return await Order.aggregate(pipeline);
};

module.exports = {
  getAnalysis,
};
