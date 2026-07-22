const axios = require("axios");
const CryptoJS = require("crypto-js");

// ======================================================
// ĐỌC VÀ KIỂM TRA CẤU HÌNH ZALOPAY
// ======================================================
const getZaloPayConfig = () => {
    const config = {
        appId: process.env.ZALO_APP_ID,
        key1: process.env.ZALO_KEY1,
        key2: process.env.ZALO_KEY2,

        // API tạo giao dịch
        createEndpoint:
            process.env.ZALO_CREATE_ENDPOINT ||
            process.env.ZALO_ENDPOINT,

        // API truy vấn trạng thái
        queryEndpoint:
            process.env.ZALO_QUERY_ENDPOINT,

        // URL public để ZaloPay gọi callback
        callbackUrl:
            process.env.ZALO_CALLBACK_URL,

        // URL React nhận kết quả redirect
        redirectUrl:
            process.env.ZALO_REDIRECT_URL ||
            "http://localhost:5173/order-success"
    };

    const missingFields = [];

    if (!config.appId) {
        missingFields.push("ZALO_APP_ID");
    }

    if (!config.key1) {
        missingFields.push("ZALO_KEY1");
    }

    if (!config.key2) {
        missingFields.push("ZALO_KEY2");
    }

    if (!config.createEndpoint) {
        missingFields.push(
            "ZALO_CREATE_ENDPOINT"
        );
    }

    if (!config.callbackUrl) {
        missingFields.push(
            "ZALO_CALLBACK_URL"
        );
    }

    if (missingFields.length > 0) {
        throw new Error(
            `Thiếu cấu hình ZaloPay: ${missingFields.join(
                ", "
            )}`
        );
    }

    return config;
};

// ======================================================
// LẤY NGÀY VIỆT NAM THEO YYMMDD
//
// Không dùng giờ UTC trực tiếp vì ZaloPay yêu cầu
// app_trans_id bắt đầu bằng ngày hiện hành GMT+7.
// ======================================================
const getVietnamDatePrefix = () => {
    const now = new Date();

    const vietnamTime = new Date(
        now.toLocaleString("en-US", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    );

    const year = String(
        vietnamTime.getFullYear()
    ).slice(-2);

    const month = String(
        vietnamTime.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        vietnamTime.getDate()
    ).padStart(2, "0");

    return `${year}${month}${day}`;
};

// ======================================================
// TẠO APP_TRANS_ID
//
// Có mã đơn hàng và phần thời gian cuối để tránh trùng
// khi người dùng tạo lại thanh toán nhiều lần.
// ======================================================
const createAppTransId = (orderId) => {
    const numericOrderId = Number(orderId);

    if (
        !Number.isInteger(numericOrderId) ||
        numericOrderId <= 0
    ) {
        throw new Error(
            "Mã đơn hàng không hợp lệ"
        );
    }

    const datePrefix =
        getVietnamDatePrefix();

    const uniqueSuffix = String(
        Date.now()
    ).slice(-6);

    return `${datePrefix}_${numericOrderId}_${uniqueSuffix}`;
};

// ======================================================
// TẠO MAC CHO API CREATE ORDER
// ======================================================
const createOrderMac = (order, key1) => {
    const macInput = [
        order.app_id,
        order.app_trans_id,
        order.app_user,
        order.amount,
        order.app_time,
        order.embed_data,
        order.item
    ].join("|");

    return CryptoJS.HmacSHA256(
        macInput,
        key1
    ).toString();
};

// ======================================================
// GỌI API TẠO GIAO DỊCH ZALOPAY
//
// Dữ liệu amount phải lấy từ database/backend,
// tuyệt đối không dùng tổng tiền frontend gửi lên.
// ======================================================
const createPaymentOrder = async ({
    orderId,
    customerId,
    amount,
    items = []
}) => {
    const config = getZaloPayConfig();

    const numericAmount = Number(amount);

    if (
        !Number.isInteger(numericAmount) ||
        numericAmount <= 0
    ) {
        throw new Error(
            "Số tiền thanh toán ZaloPay không hợp lệ"
        );
    }

    const appTransId =
        createAppTransId(orderId);

    const embedDataObject = {
        madonhang: Number(orderId),

        // Redirect được đặt trong embed_data theo API Order.
        redirecturl: config.redirectUrl
    };

    const normalizedItems =
        Array.isArray(items)
            ? items.map((item) => ({
                itemid: String(
                    item.mabienthe ||
                    item.itemid ||
                    ""
                ),

                itemname:
                    item.tensanpham ||
                    item.itemname ||
                    "Sản phẩm KICKZONE",

                itemprice:
                    Number(
                        item.giasaukhuyenmai ||
                        item.giagoc ||
                        item.itemprice ||
                        0
                    ) || 0,

                itemquantity:
                    Number(
                        item.soluong ||
                        item.itemquantity ||
                        1
                    ) || 1
            }))
            : [];

    const order = {
        app_id: Number(config.appId),

        app_trans_id: appTransId,

        app_user: String(
            customerId ||
            `kickzone-order-${orderId}`
        ),

        app_time: Date.now(),

        amount: numericAmount,

        item: JSON.stringify(
            normalizedItems
        ),

        embed_data: JSON.stringify(
            embedDataObject
        ),

        description:
            `KICKZONE - Thanh toán đơn hàng #${orderId}`,

        callback_url:
            config.callbackUrl,

        // Để trống sẽ cho phép hiển thị
        // các phương thức phù hợp trên Gateway.
        bank_code: "zalopayapp"
    };

    order.mac = createOrderMac(
        order,
        config.key1
    );

    const response = await axios.post(
        config.createEndpoint,
        null,
        {
            params: order,
            timeout: 15000
        }
    );

    const result = response.data;

    if (
        Number(result?.return_code) !== 1
    ) {
        const error = new Error(
            result?.return_message ||
            result?.sub_return_message ||
            "ZaloPay từ chối tạo giao dịch"
        );

        error.zaloPayData = result;
        throw error;
    }

    return {
        appTransId,
        orderUrl: result.order_url,
        zpTransToken:
            result.zp_trans_token || null,
        qrCode: result.qr_code || null,
        raw: result
    };
};

// ======================================================
// KIỂM TRA MAC CALLBACK
//
// ZaloPay gửi:
// {
//     data: "...",
//     mac: "..."
// }
//
// MAC callback = HMAC-SHA256(data, key2)
// ======================================================
const verifyCallbackMac = (
    data,
    receivedMac
) => {
    const config = getZaloPayConfig();

    if (
        typeof data !== "string" ||
        typeof receivedMac !== "string"
    ) {
        return false;
    }

    const calculatedMac =
        CryptoJS.HmacSHA256(
            data,
            config.key2
        ).toString();

    return calculatedMac === receivedMac;
};

// ======================================================
// PARSE CALLBACK DATA
// ======================================================
const parseCallbackData = (data) => {
    if (typeof data !== "string") {
        throw new Error(
            "Callback data không hợp lệ"
        );
    }

    const parsedData = JSON.parse(data);

    let embedData = {};

    if (parsedData.embed_data) {
        embedData =
            typeof parsedData.embed_data ===
                "string"
                ? JSON.parse(
                    parsedData.embed_data
                )
                : parsedData.embed_data;
    }

    return {
        ...parsedData,
        parsedEmbedData: embedData
    };
};

// ======================================================
// TRUY VẤN TRẠNG THÁI GIAO DỊCH
//
// Dùng khi callback bị trễ hoặc bị bỏ lỡ.
// ======================================================
const queryPaymentStatus = async (
    appTransId
) => {
    const config = getZaloPayConfig();

    if (!config.queryEndpoint) {
        throw new Error(
            "Thiếu cấu hình ZALO_QUERY_ENDPOINT"
        );
    }

    if (
        typeof appTransId !== "string" ||
        !appTransId.trim()
    ) {
        throw new Error(
            "app_trans_id không hợp lệ"
        );
    }

    /*
        Theo API query:
        hmacInput =
        app_id | app_trans_id | key1
    */
    const macInput = [
        config.appId,
        appTransId,
        config.key1
    ].join("|");

    const mac =
        CryptoJS.HmacSHA256(
            macInput,
            config.key1
        ).toString();

    const response = await axios.post(
        config.queryEndpoint,
        null,
        {
            params: {
                app_id: Number(
                    config.appId
                ),
                app_trans_id:
                    appTransId,
                mac
            },
            timeout: 15000
        }
    );

    return response.data;
};

module.exports = {
    createPaymentOrder,
    verifyCallbackMac,
    parseCallbackData,
    queryPaymentStatus
};