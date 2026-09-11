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
    const { page = 1, limit = 10, status = "all", targetType } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status !== "all") query.status = status;
    if (targetType) query.targetType = targetType;

    const reports = await Report.find(query)
        .populate("reporter", "fname email")
        .populate("targetId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.status(200).json({
        data: reports,
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
    });
});

/**
 * @desc    Get report statistics (Admin only)
 * @route   GET /api/admin/reports/stats
 */
exports.getReportStats = asyncHandler(async (req, res) => {
    const statusStats = await Report.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const typeStats = await Report.aggregate([
        {
            $group: {
                _id: "$targetType",
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

    const byStatus = Object.fromEntries(statusStats.map((s) => [s._id, s.count]));
    const byType = Object.fromEntries(typeStats.map((s) => [s._id, s.count]));
    const total = statusStats.reduce((sum, s) => sum + s.count, 0);

    res.status(200).json({
        total,
        pending: byStatus.pending || 0,
        reviewed: byStatus.reviewed || 0,
        resolved: byStatus.resolved || 0,
        dismissed: byStatus.dismissed || 0,
        productReports: byType.product || 0,
        userReports: byType.user || 0,
        statusStats,
        reasonStats
    });
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
