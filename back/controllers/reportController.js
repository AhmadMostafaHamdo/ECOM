const Report = require("../models/reportSchema");
const { asyncHandler } = require("../middleware/errorMiddleware");

/**
 * @desc    Submit a report
 * @route   POST /api/reports
 */
exports.submitReport = asyncHandler(async (req, res) => {
    const { targetType, targetId, reason, description } = req.body;
    const reporter = req.userID;

    if (!targetType || !targetId || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const targetModelRef = targetType === "product" ? "products" : "USER";

    // Check for duplicate reports
    const existingReport = await Report.findOne({ reporter, targetType, targetId });
    if (existingReport) {
        return res.status(409).json({ error: "You have already reported this item" });
    }

    const report = new Report({
        reporter,
        targetType,
        targetId,
        targetModelRef,
        reason,
        description: description || ""
    });

    await report.save();
    res.status(201).json({ success: true, data: report });
});

/**
 * @desc    Get reports (Admin only)
 * @route   GET /api/admin/reports
 */
exports.getReports = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status = "all" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status !== "all") query.status = status;

    const reports = await Report.find(query)
        .populate("reporter", "fname email")
        .populate("targetId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.status(200).json({
        data: reports,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Get report statistics (Admin only)
 * @route   GET /api/admin/reports/stats
 */
exports.getReportStats = asyncHandler(async (req, res) => {
    const stats = await Report.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const reasonStats = await Report.aggregate([
        {
            $group: {
                _id: "$reason",
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({ statusStats: stats, reasonStats });
});

/**
 * @desc    Delete a report (Admin only)
 * @route   DELETE /api/admin/reports/:id
 */
exports.deleteReport = asyncHandler(async (req, res) => {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Report not found" });
    res.status(200).json({ success: true, deletedReportId: deleted._id });
});
