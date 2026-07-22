const Order = require("../models/orderModel");
// ======================================================
// LẤY MÃ NGƯỜI DÙNG TỪ TOKEN
// ======================================================
const getAuthenticatedCustomerId = (req) => {
    const customerId = Number(
        req.user?.manguoidung ||
        req.user?.id
    );

    if (
        !Number.isInteger(customerId) ||
        customerId <= 0
    ) {
        return null;
    }

    return customerId;
};

// ======================================================
// CÁC TRẠNG THÁI ĐƠN HÀNG HỢP LỆ
// ======================================================
const ORDER_STATUSES = [
    "chờ xác nhận",
    "đang xử lý",
    "đang giao",
    "đã giao",
    "đã hủy"
];

// ======================================================
// LUỒNG CHUYỂN TRẠNG THÁI HỢP LỆ
//
// Không cho đơn hàng quay ngược trạng thái.
// Đơn đã giao hoặc đã hủy được xem là kết thúc.
// ======================================================
const STATUS_TRANSITIONS = {
    "chờ xác nhận": [
        "đang xử lý",
        "đã hủy"
    ],

    "đang xử lý": [
        "đang giao",
        "đã hủy"
    ],

    "đang giao": [
        "đã giao"
    ],

    "đã giao": [],

    "đã hủy": []
};

// ======================================================
// CHUẨN HÓA DỮ LIỆU ĐƠN HÀNG TRẢ VỀ FRONTEND
// ======================================================
const normalizeOrder = (order) => {
    if (!order) return null;

    return {
        ...order,

        madonhang: Number(order.madonhang),

        manguoidung:
            order.manguoidung !== null &&
                order.manguoidung !== undefined
                ? Number(order.manguoidung)
                : null,

        mavoucher:
            order.mavoucher !== null &&
                order.mavoucher !== undefined
                ? Number(order.mavoucher)
                : null,

        dathanhtoan: Number(
            order.dathanhtoan || 0
        ),

        tongtien: Number(
            order.tongtien || 0
        ),

        phivanchuyen: Number(
            order.phivanchuyen || 0
        ),

        tongthanhtoan: Number(
            order.tongthanhtoan || 0
        ),

        ...(order.sodongchitiet !== undefined
            ? {
                sodongchitiet: Number(
                    order.sodongchitiet || 0
                )
            }
            : {}),

        ...(order.tongsoluongsanpham !== undefined
            ? {
                tongsoluongsanpham: Number(
                    order.tongsoluongsanpham || 0
                )
            }
            : {})
    };
};

// ======================================================
// CHUẨN HÓA CHI TIẾT SẢN PHẨM TRONG ĐƠN
// ======================================================
const normalizeOrderItem = (item) => {
    if (!item) return null;

    return {
        ...item,

        machitietdonhang: Number(
            item.machitietdonhang
        ),

        madonhang: Number(item.madonhang),

        mabienthe: Number(item.mabienthe),

        soluong: Number(item.soluong || 0),

        giagoc: Number(item.giagoc || 0),

        giakhuyenmai: Number(
            item.giakhuyenmai || 0
        ),

        giasaukhuyenmai: Number(
            item.giasaukhuyenmai || 0
        ),

        thanhtien: Number(
            item.thanhtien || 0
        )
    };
};

// ======================================================
// KIỂM TRA ID ĐƠN HÀNG
// ======================================================
const validateOrderId = (rawId) => {
    const orderId = Number(rawId);

    if (
        !Number.isInteger(orderId) ||
        orderId <= 0
    ) {
        return {
            error: "Mã đơn hàng không hợp lệ"
        };
    }

    return {
        orderId
    };
};
// ======================================================
// KIỂM TRA NGÀY GIỜ HỢP LỆ
// Chấp nhận chuỗi ngày mà JavaScript có thể phân tích.
// ======================================================
const validateDateTime = (value) => {
    if (!value) {
        return {
            value: null
        };
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return {
            error:
                "Ngày dự kiến giao không hợp lệ"
        };
    }

    return {
        value
    };
};
// ======================================================
// 1. ADMIN: LẤY DANH SÁCH ĐƠN HÀNG
//
// GET /api/orders/admin/list
//
// Query hỗ trợ:
// ?status=đã giao
// ?payment=1
// ?customerId=3
// ======================================================
const getAdminOrders = async (req, res) => {
    try {
        const {
            status,
            payment,
            customerId
        } = req.query;

        // Kiểm tra trạng thái nếu có truyền lên
        if (
            status &&
            !ORDER_STATUSES.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Trạng thái lọc đơn hàng không hợp lệ"
            });
        }

        // Thanh toán chỉ nhận 0 hoặc 1
        if (
            payment !== undefined &&
            payment !== "" &&
            !["0", "1"].includes(
                String(payment)
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Trạng thái thanh toán chỉ được là 0 hoặc 1"
            });
        }

        // customerId nếu có phải là số nguyên dương
        if (
            customerId !== undefined &&
            customerId !== ""
        ) {
            const parsedCustomerId =
                Number(customerId);

            if (
                !Number.isInteger(
                    parsedCustomerId
                ) ||
                parsedCustomerId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Mã khách hàng không hợp lệ"
                });
            }
        }

        const orders =
            await Order.getAdminOrders({
                status:
                    status || undefined,

                payment:
                    payment !== undefined &&
                        payment !== ""
                        ? Number(payment)
                        : undefined,

                customerId:
                    customerId !== undefined &&
                        customerId !== ""
                        ? Number(customerId)
                        : undefined
            });

        return res.status(200).json({
            success: true,
            message:
                "Lấy danh sách đơn hàng thành công",
            data: orders.map(normalizeOrder)
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh sách đơn hàng:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy danh sách đơn hàng"
        });
    }
};

// ======================================================
// 2. ADMIN: LẤY CHI TIẾT ĐƠN HÀNG
//
// GET /api/orders/admin/:id
// ======================================================
const getOrderDetail = async (req, res) => {
    try {
        const validation =
            validateOrderId(req.params.id);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const { orderId } = validation;

        const order =
            await Order.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy đơn hàng"
            });
        }

        const items =
            await Order.getOrderItems(orderId);

        return res.status(200).json({
            success: true,
            message:
                "Lấy chi tiết đơn hàng thành công",
            data: {
                ...normalizeOrder(order),

                items: items.map(
                    normalizeOrderItem
                )
            }
        });
    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết đơn hàng:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy chi tiết đơn hàng"
        });
    }
};

// ======================================================
// 3. ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
//
// PUT /api/orders/admin/:id/status
//
// Body ví dụ:
//
// {
//     "trangthai": "đang giao",
//     "ngaydukiengiao": "2026-07-20 17:00:00"
// }
//
// donvivanchuyen là không bắt buộc.
// Nếu có thì hệ thống chỉ lưu dưới dạng thông tin thủ công.
const updateOrderStatus = async (req, res) => {
    try {
        const validation =
            validateOrderId(req.params.id);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const { orderId } = validation;

        let {
            trangthai,
            lydo_huy,
            donvivanchuyen,
            ngaydukiengiao
        } = req.body;

        trangthai = String(
            trangthai || ""
        ).trim();

        lydo_huy = String(
            lydo_huy || ""
        ).trim();

        donvivanchuyen = String(
            donvivanchuyen || ""
        ).trim();

        ngaydukiengiao =
            ngaydukiengiao || null;

        const expectedDateValidation =
            validateDateTime(ngaydukiengiao);

        if (expectedDateValidation.error) {
            return res.status(400).json({
                success: false,
                message:
                    expectedDateValidation.error
            });
        }

        ngaydukiengiao =
            expectedDateValidation.value;
        if (!trangthai) {
            return res.status(400).json({
                success: false,
                message:
                    "Trạng thái đơn hàng không được để trống"
            });
        }

        if (
            !ORDER_STATUSES.includes(trangthai)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Trạng thái đơn hàng không hợp lệ"
            });
        }

        const currentOrder =
            await Order.getOrderById(orderId);

        if (!currentOrder) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy đơn hàng"
            });
        }

        const currentStatus =
            currentOrder.trangthai;

        // Nếu trạng thái không thay đổi thì không update thừa
        if (currentStatus === trangthai) {
            return res.status(200).json({
                success: true,
                message:
                    `Đơn hàng đang ở trạng thái "${trangthai}"`,
                data:
                    normalizeOrder(currentOrder)
            });
        }

        // Đơn đã giao là trạng thái kết thúc
        if (currentStatus === "đã giao") {
            return res.status(409).json({
                success: false,
                message:
                    "Đơn hàng đã giao nên không thể thay đổi sang trạng thái khác"
            });
        }

        // Đơn đã hủy là trạng thái kết thúc
        if (currentStatus === "đã hủy") {
            return res.status(409).json({
                success: false,
                message:
                    "Đơn hàng đã hủy nên không thể khôi phục hoặc chuyển trạng thái"
            });
        }

        const allowedNextStatuses =
            STATUS_TRANSITIONS[
            currentStatus
            ] || [];

        if (
            !allowedNextStatuses.includes(
                trangthai
            )
        ) {
            return res.status(409).json({
                success: false,
                message:
                    `Không thể chuyển đơn hàng từ "${currentStatus}" sang "${trangthai}"`
            });
        }

        // Khi hủy bắt buộc phải có lý do
        if (trangthai === "đã hủy") {
            if (!lydo_huy) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Vui lòng nhập lý do hủy đơn hàng"
                });
            }

            if (
                lydo_huy.length < 5 ||
                lydo_huy.length > 500
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Lý do hủy phải có từ 5 đến 500 ký tự"
                });
            }
        } else {
            // Không phải trạng thái hủy thì xóa lý do hủy
            lydo_huy = null;
        }

        // Nếu frontend không gửi dữ liệu mới,
        // giữ thông tin cũ trong database.
        const finalShippingUnit =
            donvivanchuyen ||
            currentOrder.donvivanchuyen ||
            null;

        const finalExpectedDate =
            ngaydukiengiao ||
            currentOrder.ngaydukiengiao ||
            null;

        // Đơn vị vận chuyển không bắt buộc.
        // Nếu có nhập thì chỉ giới hạn độ dài hợp lý.
        if (
            finalShippingUnit &&
            (
                finalShippingUnit.length < 2 ||
                finalShippingUnit.length > 250
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Tên đơn vị vận chuyển phải có từ 2 đến 250 ký tự"
            });
        }
        const affectedRows =
            await Order.updateOrderStatus(
                orderId,
                {
                    trangthai,
                    lydo_huy,
                    donvivanchuyen:
                        finalShippingUnit,
                    ngaydukiengiao:
                        finalExpectedDate
                }
            );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy đơn hàng để cập nhật"
            });
        }

        /*
            Khi đơn chuyển sang đã giao:

            - Nếu là COD thì xem như đã thu tiền.
            - Nếu chưa thanh toán thì tự chuyển dathanhtoan = 1.
            - ZaloPay thường đã thanh toán từ trước nên không ảnh hưởng.
        */
        if (
            trangthai === "đã giao" &&
            Number(
                currentOrder.dathanhtoan
            ) === 0
        ) {
            await Order.updatePaymentStatus(
                orderId,
                1
            );
        }

        const updatedOrder =
            await Order.getOrderById(orderId);

        return res.status(200).json({
            success: true,
            message:
                trangthai === "đã hủy"
                    ? "Hủy đơn hàng thành công"
                    : `Cập nhật trạng thái đơn hàng thành "${trangthai}" thành công`,
            data:
                normalizeOrder(updatedOrder)
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật trạng thái đơn hàng:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể cập nhật trạng thái đơn hàng"
        });
    }
};

// ======================================================
// 4. ADMIN: CẬP NHẬT THANH TOÁN
//
// PUT /api/orders/admin/:id/payment
//
// Body:
//
// {
//     "dathanhtoan": 1
// }
//
// 0 = chưa thanh toán
// 1 = đã thanh toán
// ======================================================
const updatePaymentStatus = async (
    req,
    res
) => {
    try {
        const validation =
            validateOrderId(req.params.id);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const { orderId } = validation;

        const rawPaymentStatus =
            req.body.dathanhtoan;

        if (
            ![
                0,
                1,
                "0",
                "1"
            ].includes(rawPaymentStatus)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Trạng thái thanh toán chỉ được là 0 hoặc 1"
            });
        }

        const paymentStatus = Number(
            rawPaymentStatus
        );

        const currentOrder =
            await Order.getOrderById(orderId);

        if (!currentOrder) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy đơn hàng"
            });
        }

        // Đơn hủy không được chuyển thành đã thanh toán
        if (
            currentOrder.trangthai ===
            "đã hủy" &&
            paymentStatus === 1
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Không thể đánh dấu đã thanh toán cho đơn hàng đã hủy"
            });
        }

        // Đơn đã giao không nên quay về chưa thanh toán
        if (
            currentOrder.trangthai ===
            "đã giao" &&
            paymentStatus === 0
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Không thể chuyển đơn đã giao về trạng thái chưa thanh toán"
            });
        }

        if (
            Number(
                currentOrder.dathanhtoan
            ) === paymentStatus
        ) {
            return res.status(200).json({
                success: true,
                message:
                    paymentStatus === 1
                        ? "Đơn hàng đã được thanh toán"
                        : "Đơn hàng đang chưa thanh toán",
                data:
                    normalizeOrder(
                        currentOrder
                    )
            });
        }

        const affectedRows =
            await Order.updatePaymentStatus(
                orderId,
                paymentStatus
            );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy đơn hàng để cập nhật"
            });
        }

        const updatedOrder =
            await Order.getOrderById(orderId);

        return res.status(200).json({
            success: true,
            message:
                paymentStatus === 1
                    ? "Xác nhận thanh toán thành công"
                    : "Chuyển đơn hàng về chưa thanh toán thành công",
            data:
                normalizeOrder(updatedOrder)
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật thanh toán:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể cập nhật trạng thái thanh toán"
        });
    }
};

// ======================================================
// 5. ADMIN: LẤY DỮ LIỆU DASHBOARD
//
// GET /api/orders/admin/dashboard
// ======================================================
const getDashboard = async (req, res) => {
    try {
        const [
            summary,
            recentOrders,
            bestSellingProducts,
            lowStockProducts
        ] = await Promise.all([
            Order.getDashboardSummary(),

            Order.getRecentOrders(5),

            Order.getBestSellingProducts(5),

            Order.getLowStockProducts(
                15,
                5
            )
        ]);

        return res.status(200).json({
            success: true,
            message:
                "Lấy dữ liệu Dashboard thành công",

            data: {
                summary: {
                    doanhthu: Number(
                        summary?.doanhthu || 0
                    ),

                    tongdonhang: Number(
                        summary?.tongdonhang || 0
                    ),

                    tongsanpham: Number(
                        summary?.tongsanpham || 0
                    ),

                    tongkhachhang: Number(
                        summary?.tongkhachhang || 0
                    ),

                    donchoxacnhan: Number(
                        summary?.donchoxacnhan ||
                        0
                    ),

                    donhuy: Number(
                        summary?.donhuy || 0
                    )
                },

                recentOrders:
                    recentOrders.map(
                        (order) => ({
                            ...order,

                            madonhang: Number(
                                order.madonhang
                            ),

                            tongthanhtoan:
                                Number(
                                    order.tongthanhtoan ||
                                    0
                                )
                        })
                    ),

                bestSellingProducts:
                    bestSellingProducts.map(
                        (product) => ({
                            ...product,

                            masanpham:
                                product.masanpham !==
                                    null &&
                                    product.masanpham !==
                                    undefined
                                    ? Number(
                                        product.masanpham
                                    )
                                    : null,

                            soluongban: Number(
                                product.soluongban ||
                                0
                            ),

                            doanhthusanpham:
                                Number(
                                    product.doanhthusanpham ||
                                    0
                                )
                        })
                    ),

                lowStockProducts:
                    lowStockProducts.map(
                        (product) => ({
                            ...product,

                            masanpham: Number(
                                product.masanpham
                            ),

                            tongtonkho:
                                Number(
                                    product.tongtonkho ||
                                    0
                                )
                        })
                    )
            }
        });
    } catch (error) {
        console.error(
            "Lỗi lấy Dashboard:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy dữ liệu Dashboard"
        });
    }
};

// ======================================================
// 6. ADMIN: THỐNG KÊ DOANH THU THEO NĂM
//
// GET /api/orders/admin/revenue?year=2026
// ======================================================
const getRevenueStatistics = async (
    req,
    res
) => {
    try {
        const currentYear =
            new Date().getFullYear();

        const year =
            req.query.year !== undefined
                ? Number(req.query.year)
                : currentYear;

        if (
            !Number.isInteger(year) ||
            year < 2000 ||
            year > 2100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Năm thống kê không hợp lệ"
            });
        }

        const [
            monthlyRows,
            summary,
            availableYearRows
        ] = await Promise.all([
            Order.getMonthlyRevenue(year),

            Order.getRevenueSummaryByYear(
                year
            ),

            Order.getAvailableRevenueYears()
        ]);

        /*
            Tạo đủ 12 tháng.
            Tháng chưa có doanh thu sẽ là 0.
        */
        const monthlyMap = new Map(
            monthlyRows.map((row) => [
                Number(row.thang),
                {
                    doanhthu: Number(
                        row.doanhthu || 0
                    ),

                    sodondagiao: Number(
                        row.sodondagiao || 0
                    )
                }
            ])
        );

        const months = Array.from(
            { length: 12 },
            (_, index) => {
                const month = index + 1;

                const row =
                    monthlyMap.get(month);

                return {
                    thang: month,

                    doanhthu:
                        row?.doanhthu || 0,

                    sodondagiao:
                        row?.sodondagiao ||
                        0
                };
            }
        );

        const highestMonth = months.reduce(
            (highest, current) => {
                if (
                    current.doanhthu >
                    highest.doanhthu
                ) {
                    return current;
                }

                return highest;
            },
            {
                thang: 0,
                doanhthu: 0,
                sodondagiao: 0
            }
        );

        const availableYears =
            availableYearRows
                .map((row) =>
                    Number(row.nam)
                )
                .filter(
                    (value) =>
                        Number.isInteger(value)
                );

        // Nếu năm đang xem chưa nằm trong danh sách,
        // thêm vào để dropdown vẫn hiển thị đúng.
        if (
            !availableYears.includes(year)
        ) {
            availableYears.push(year);
            availableYears.sort(
                (a, b) => b - a
            );
        }

        return res.status(200).json({
            success: true,
            message:
                "Lấy thống kê doanh thu thành công",

            data: {
                year,

                summary: {
                    tongdoanhthu: Number(
                        summary?.tongdoanhthu ||
                        0
                    ),

                    sodondagiao: Number(
                        summary?.sodondagiao ||
                        0
                    ),

                    sodondahuy: Number(
                        summary?.sodondahuy ||
                        0
                    ),

                    tongdontrongnam:
                        Number(
                            summary?.tongdontrongnam ||
                            0
                        ),

                    thangcaonhat:
                        highestMonth.thang,

                    doanhthucaonhat:
                        highestMonth.doanhthu
                },

                months,

                availableYears
            }
        });
    } catch (error) {
        console.error(
            "Lỗi thống kê doanh thu:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy thống kê doanh thu"
        });
    }
};
// ======================================================
// KHÁCH HÀNG: LẤY LỊCH SỬ ĐƠN HÀNG
//
// GET /api/orders/my-orders
// ======================================================
const getMyOrders = async (req, res) => {
    try {
        const customerId =
            getAuthenticatedCustomerId(req);

        if (!customerId) {
            return res.status(401).json({
                success: false,
                message:
                    "Thông tin đăng nhập không hợp lệ"
            });
        }

        const orders =
            await Order.getMyOrders(customerId);

        return res.status(200).json({
            success: true,
            message:
                "Lấy lịch sử đơn hàng thành công",
            data: orders.map((order) => ({
                ...normalizeOrder(order),

                sodongchitiet: Number(
                    order.sodongchitiet || 0
                ),

                tongsoluongsanpham: Number(
                    order.tongsoluongsanpham || 0
                )
            }))
        });
    } catch (error) {
        console.error(
            "Lỗi lấy lịch sử đơn hàng:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy lịch sử đơn hàng"
        });
    }
};

// ======================================================
// KHÁCH HÀNG: XEM CHI TIẾT ĐƠN CỦA MÌNH
//
// GET /api/orders/my-orders/:id
// ======================================================
const getMyOrderDetail = async (req, res) => {
    try {
        const validation =
            validateOrderId(req.params.id);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const customerId =
            getAuthenticatedCustomerId(req);

        if (!customerId) {
            return res.status(401).json({
                success: false,
                message:
                    "Thông tin đăng nhập không hợp lệ"
            });
        }

        const order =
            await Order.getMyOrderById(
                validation.orderId,
                customerId
            );

        // Không nói đơn thuộc người khác
        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy đơn hàng"
            });
        }

        const items =
            await Order.getOrderItems(
                validation.orderId
            );

        return res.status(200).json({
            success: true,
            message:
                "Lấy chi tiết đơn hàng thành công",
            data: {
                ...normalizeOrder(order),

                items: items.map(
                    normalizeOrderItem
                )
            }
        });
    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết đơn của khách hàng:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy chi tiết đơn hàng"
        });
    }
};
// ======================================================
// KHÁCH HÀNG: THANH TOÁN COD
//
// POST /api/orders/checkout/cod
//
// Backend chỉ nhận:
// - thông tin người nhận
// - mã voucher nếu có
// - mã biến thể và số lượng
//
// Không nhận giá, giảm giá hoặc tổng tiền từ frontend.
// ======================================================
const checkoutCOD = async (req, res) => {
    try {
        const customerId =
            getAuthenticatedCustomerId(req);

        if (!customerId) {
            return res.status(401).json({
                success: false,
                message:
                    "Thông tin đăng nhập không hợp lệ"
            });
        }

        let {
            tennguoinhan,
            sodienthoai,
            diachigiao,
            ghichu,
            mavoucher,
            items
        } = req.body;

        tennguoinhan = String(
            tennguoinhan || ""
        ).trim();

        sodienthoai = String(
            sodienthoai || ""
        ).trim();

        diachigiao = String(
            diachigiao || ""
        ).trim();

        ghichu = String(
            ghichu || ""
        ).trim();

        // ==================================================
        // THÔNG TIN NGƯỜI NHẬN
        // ==================================================
        if (
            tennguoinhan.length < 2 ||
            tennguoinhan.length > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Tên người nhận phải có từ 2 đến 100 ký tự"
            });
        }

        /*
            Đồng bộ với đăng ký:
            số điện thoại Việt Nam gồm 10 số.
        */
        if (
            !/^0(3|5|7|8|9)\d{8}$/.test(
                sodienthoai
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Số điện thoại không hợp lệ"
            });
        }

        if (
            diachigiao.length < 10 ||
            diachigiao.length > 500
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Địa chỉ giao hàng phải có từ 10 đến 500 ký tự"
            });
        }

        if (ghichu.length > 500) {
            return res.status(400).json({
                success: false,
                message:
                    "Ghi chú không được vượt quá 500 ký tự"
            });
        }

        ghichu = ghichu || null;

        // ==================================================
        // VOUCHER KHÔNG BẮT BUỘC
        // ==================================================
        if (
            mavoucher === undefined ||
            mavoucher === null ||
            mavoucher === ""
        ) {
            mavoucher = null;
        } else {
            mavoucher = Number(mavoucher);

            if (
                !Number.isInteger(mavoucher) ||
                mavoucher <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Mã voucher không hợp lệ"
                });
            }
        }

        // ==================================================
        // KIỂM TRA GIỎ HÀNG
        // ==================================================
        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Giỏ hàng không được để trống"
            });
        }

        /*
            Giới hạn nhẹ để tránh payload bất thường.
            Một đơn tối đa 50 dòng biến thể.
        */
        if (items.length > 50) {
            return res.status(400).json({
                success: false,
                message:
                    "Đơn hàng có quá nhiều sản phẩm"
            });
        }

        const normalizedItems = [];

        const variantIds = new Set();

        for (const item of items) {
            const variantId = Number(
                item?.mabienthe
            );

            const quantity = Number(
                item?.soluong
            );

            if (
                !Number.isInteger(
                    variantId
                ) ||
                variantId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Mã biến thể sản phẩm không hợp lệ"
                });
            }

            if (
                !Number.isInteger(
                    quantity
                ) ||
                quantity <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Số lượng sản phẩm phải là số nguyên dương"
                });
            }

            /*
                Giới hạn mỗi biến thể tối đa 100
                để tránh request bất thường.
                Tồn kho thật vẫn được kiểm tra ở Model.
            */
            if (quantity > 100) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Số lượng của một sản phẩm không được vượt quá 100"
                });
            }

            if (
                variantIds.has(variantId)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Biến thể ${variantId} đang bị lặp trong giỏ hàng`
                });
            }

            variantIds.add(variantId);

            normalizedItems.push({
                mabienthe: variantId,
                soluong: quantity
            });
        }

        const createdOrder =
            await Order.checkoutCOD({
                customerId,
                tennguoinhan,
                sodienthoai,
                diachigiao,
                ghichu,
                mavoucher,
                items: normalizedItems
            });

        return res.status(201).json({
            success: true,
            message:
                "Đặt hàng COD thành công",
            data: createdOrder
        });
    } catch (error) {
        console.error(
            "Lỗi đặt hàng COD:",
            error
        );

        /*
            Lỗi nghiệp vụ được Model gắn statusCode.
            Lỗi SQL hoặc lỗi ngoài dự kiến trả 500.
        */
        if (error.statusCode) {
            return res
                .status(error.statusCode)
                .json({
                    success: false,
                    message: error.message
                });
        }

        return res.status(500).json({
            success: false,
            message:
                "Không thể tạo đơn hàng COD"
        });
    }
};
module.exports = {
    getAdminOrders,
    getOrderDetail,
    updateOrderStatus,
    updatePaymentStatus,
    getDashboard,
    getRevenueStatistics,

    getMyOrders,
    getMyOrderDetail,

    checkoutCOD
};