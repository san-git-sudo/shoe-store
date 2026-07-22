const Order = require(
    "../models/orderModel"
);

const {
    createPaymentOrder,
    verifyCallbackMac,
    parseCallbackData,
    queryPaymentStatus
} = require(
    "../services/zalopayService"
);

// ======================================================
// LẤY MÃ NGƯỜI DÙNG TỪ JWT
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
// CHUẨN HÓA VÀ KIỂM TRA PAYLOAD CHECKOUT
//
// Đồng bộ ràng buộc với checkout COD.
// ======================================================
const validateCheckoutPayload = (
    requestBody
) => {
    let {
        tennguoinhan,
        sodienthoai,
        diachigiao,
        ghichu,
        mavoucher,
        items
    } = requestBody;

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

    if (
        tennguoinhan.length < 2 ||
        tennguoinhan.length > 100
    ) {
        return {
            error:
                "Tên người nhận phải có từ 2 đến 100 ký tự"
        };
    }

    if (
        !/^0(3|5|7|8|9)\d{8}$/.test(
            sodienthoai
        )
    ) {
        return {
            error:
                "Số điện thoại không hợp lệ"
        };
    }

    if (
        diachigiao.length < 10 ||
        diachigiao.length > 500
    ) {
        return {
            error:
                "Địa chỉ giao hàng phải có từ 10 đến 500 ký tự"
        };
    }

    if (ghichu.length > 500) {
        return {
            error:
                "Ghi chú không được vượt quá 500 ký tự"
        };
    }

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
            return {
                error:
                    "Mã voucher không hợp lệ"
            };
        }
    }

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return {
            error:
                "Giỏ hàng không được để trống"
        };
    }

    if (items.length > 50) {
        return {
            error:
                "Đơn hàng có quá nhiều sản phẩm"
        };
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
            !Number.isInteger(variantId) ||
            variantId <= 0
        ) {
            return {
                error:
                    "Mã biến thể sản phẩm không hợp lệ"
            };
        }

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return {
                error:
                    "Số lượng sản phẩm phải là số nguyên dương"
            };
        }

        if (quantity > 100) {
            return {
                error:
                    "Số lượng của một sản phẩm không được vượt quá 100"
            };
        }

        if (variantIds.has(variantId)) {
            return {
                error:
                    `Biến thể ${variantId} đang bị lặp trong giỏ hàng`
            };
        }

        variantIds.add(variantId);

        normalizedItems.push({
            mabienthe: variantId,
            soluong: quantity
        });
    }

    return {
        data: {
            tennguoinhan,
            sodienthoai,
            diachigiao,
            ghichu:
                ghichu || null,
            mavoucher,
            items: normalizedItems
        }
    };
};

// ======================================================
// KHÁCH HÀNG: TẠO THANH TOÁN ZALOPAY
//
// POST /api/zalopay/create
//
// Có verifyToken.
// Frontend không gửi giá hoặc tổng tiền.
// ======================================================
const createZaloPayPayment = async (
    req,
    res
) => {
    let createdOrder = null;

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

        const validation =
            validateCheckoutPayload(
                req.body
            );

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        /*
            Model tự:
            - kiểm tra người dùng
            - kiểm tra giá
            - kiểm tra voucher
            - kiểm tra tồn kho
            - tạo đơn
            - tạo chi tiết
            - trừ kho
        */
        createdOrder =
            await Order.checkoutZaloPay({
                customerId,
                ...validation.data
            });

        /*
            Số tiền này đã được backend tính từ database,
            không phải dữ liệu frontend.
        */
        const amount = Math.round(
            Number(
                createdOrder.tongthanhtoan
            )
        );

        const paymentResult =
            await createPaymentOrder({
                orderId:
                    createdOrder.madonhang,

                customerId,

                amount,

                items:
                    createdOrder.items || []
            });

        const affectedRows =
            await Order.updateZaloPayAppTransId(
                createdOrder.madonhang,
                paymentResult.appTransId
            );

        if (affectedRows !== 1) {
            throw new Error(
                "Không thể lưu mã giao dịch ZaloPay vào đơn hàng"
            );
        }

        return res.status(201).json({
            success: true,
            message:
                "Khởi tạo thanh toán ZaloPay thành công",

            data: {
                madonhang:
                    createdOrder.madonhang,

                manguoidung:
                    createdOrder.manguoidung,

                mavoucher:
                    createdOrder.mavoucher,

                hinhthucthanhtoan:
                    "ZaloPay",

                dathanhtoan: 0,

                tongtien:
                    createdOrder.tongtien,

                giamgia:
                    createdOrder.giamgia,

                phivanchuyen:
                    createdOrder.phivanchuyen,

                tongthanhtoan:
                    createdOrder.tongthanhtoan,

                trangthai:
                    createdOrder.trangthai,

                app_trans_id:
                    paymentResult.appTransId,

                order_url:
                    paymentResult.orderUrl,

                zp_trans_token:
                    paymentResult.zpTransToken,

                qr_code:
                    paymentResult.qrCode
            }
        });
    } catch (error) {
        console.error(
            "Lỗi khởi tạo thanh toán ZaloPay:",
            error
        );

        /*
            Nếu đơn đã tạo nhưng ZaloPay không tạo
            được giao dịch thì hủy đơn và hoàn kho.
        */
        if (createdOrder?.madonhang) {
            try {
                await Order.cancelFailedZaloPayOrder(
                    createdOrder.madonhang,
                    error.message
                );
            } catch (rollbackError) {
                console.error(
                    "Lỗi hoàn tác đơn ZaloPay:",
                    rollbackError
                );
            }
        }

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
                error.message ||
                "Không thể khởi tạo thanh toán ZaloPay"
        });
    }
};

// ======================================================
// CALLBACK TỪ ZALOPAY
//
// POST /api/zalopay/callback
//
// KHÔNG dùng verifyToken vì request đến từ ZaloPay.
// Bảo mật bằng MAC với key2.
// ======================================================
const zaloPayCallback = async (
    req,
    res
) => {
    try {
        const { data, mac } = req.body;

        if (
            typeof data !== "string" ||
            typeof mac !== "string"
        ) {
            return res.json({
                return_code: 0,
                return_message:
                    "Dữ liệu callback không hợp lệ"
            });
        }

        const validMac =
            verifyCallbackMac(
                data,
                mac
            );

        if (!validMac) {
            console.warn(
                "ZaloPay callback MAC không hợp lệ"
            );

            return res.json({
                return_code: -1,
                return_message:
                    "MAC không hợp lệ"
            });
        }

        const callbackData =
            parseCallbackData(data);

        const appTransId = String(
            callbackData.app_trans_id ||
            ""
        ).trim();

        const zaloPayTransId =
            callbackData.zp_trans_id
                ? String(
                    callbackData.zp_trans_id
                )
                : null;

        if (!appTransId) {
            return res.json({
                return_code: 0,
                return_message:
                    "Không xác định được app_trans_id"
            });
        }

        /*
            Kiểm tra đơn trong database trước khi update.
        */
        const order =
            await Order.getOrderByAppTransId(
                appTransId
            );

        if (!order) {
            console.warn(
                "Không tìm thấy đơn theo app_trans_id:",
                appTransId
            );

            return res.json({
                return_code: 0,
                return_message:
                    "Không tìm thấy đơn hàng"
            });
        }

        /*
            Kiểm tra amount callback với số tiền backend lưu.
        */
        const callbackAmount = Number(
            callbackData.amount
        );

        const databaseAmount = Number(
            order.tongthanhtoan
        );

        if (
            !Number.isFinite(
                callbackAmount
            ) ||
            callbackAmount !==
            databaseAmount
        ) {
            console.warn(
                "Số tiền callback không khớp:",
                {
                    callbackAmount,
                    databaseAmount,
                    appTransId
                }
            );

            return res.json({
                return_code: 0,
                return_message:
                    "Số tiền thanh toán không khớp"
            });
        }

        const result =
            await Order.confirmZaloPayPayment({
                appTransId,
                zaloPayTransId
            });

        console.log(
            "ZaloPay callback thành công:",
            {
                appTransId,
                zaloPayTransId,
                orderId:
                    result.madonhang,
                alreadyPaid:
                    result.alreadyPaid
            }
        );

        return res.json({
            return_code: 1,
            return_message:
                "Xử lý callback thành công"
        });
    } catch (error) {
        console.error(
            "Lỗi callback ZaloPay:",
            error
        );

        return res.json({
            return_code: 0,
            return_message:
                "Lỗi xử lý callback"
        });
    }
};

// ======================================================
// KHÁCH HÀNG: KIỂM TRA TRẠNG THÁI ZALOPAY
//
// GET /api/zalopay/status/:appTransId
//
// Có verifyToken.
// Chỉ cho xem giao dịch thuộc tài khoản đang đăng nhập.
// ======================================================
const getZaloPayStatus = async (
    req,
    res
) => {
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

        const appTransId = String(
            req.params.appTransId || ""
        ).trim();

        if (
            !/^\d{6}_[A-Za-z0-9_-]+$/.test(
                appTransId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "app_trans_id không hợp lệ"
            });
        }

        const order =
            await Order.getOrderByAppTransId(
                appTransId
            );

        if (
            !order ||
            Number(order.manguoidung) !==
            customerId
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy giao dịch"
            });
        }

        /*
            Nếu database đã xác nhận thanh toán,
            không cần gọi ZaloPay thêm.
        */
        if (
            Number(order.dathanhtoan) === 1
        ) {
            return res.status(200).json({
                success: true,
                message:
                    "Giao dịch đã thanh toán",

                data: {
                    madonhang:
                        Number(
                            order.madonhang
                        ),

                    app_trans_id:
                        order.app_trans_id,

                    zalopay_trans_id:
                        order.zalopay_trans_id,

                    dathanhtoan: 1,

                    trangthai:
                        order.trangthai,

                    tongthanhtoan:
                        Number(
                            order.tongthanhtoan
                        )
                }
            });
        }

        const zaloPayResult =
            await queryPaymentStatus(
                appTransId
            );

        /*
            Nếu ZaloPay báo giao dịch thành công nhưng
            callback chưa cập nhật database, chủ động
            đồng bộ lại.
        */
        if (
            Number(
                zaloPayResult?.return_code
            ) === 1
        ) {
            await Order.confirmZaloPayPayment({
                appTransId,

                zaloPayTransId:
                    zaloPayResult.zp_trans_id
                        ? String(
                            zaloPayResult.zp_trans_id
                        )
                        : null
            });
        }

        const updatedOrder =
            await Order.getOrderByAppTransId(
                appTransId
            );

        return res.status(200).json({
            success: true,
            message:
                Number(
                    updatedOrder?.dathanhtoan
                ) === 1
                    ? "Giao dịch đã thanh toán"
                    : "Giao dịch chưa được thanh toán",

            data: {
                madonhang:
                    Number(
                        updatedOrder.madonhang
                    ),

                app_trans_id:
                    updatedOrder.app_trans_id,

                zalopay_trans_id:
                    updatedOrder.zalopay_trans_id,

                dathanhtoan:
                    Number(
                        updatedOrder.dathanhtoan
                    ),

                trangthai:
                    updatedOrder.trangthai,

                tongthanhtoan:
                    Number(
                        updatedOrder.tongthanhtoan
                    ),

                zaloPay:
                    zaloPayResult
            }
        });
    } catch (error) {
        console.error(
            "Lỗi truy vấn trạng thái ZaloPay:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Không thể kiểm tra trạng thái ZaloPay"
        });
    }
};

module.exports = {
    createZaloPayPayment,
    zaloPayCallback,
    getZaloPayStatus
};