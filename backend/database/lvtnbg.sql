-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th6 29, 2026 lúc 02:51 PM
-- Phiên bản máy phục vụ: 8.3.0
-- Phiên bản PHP: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `lvtnbg`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bienthesanpham`
--

DROP TABLE IF EXISTS `bienthesanpham`;
CREATE TABLE IF NOT EXISTS `bienthesanpham` (
  `mabienthe` int NOT NULL AUTO_INCREMENT,
  `masanpham` int DEFAULT NULL,
  `makichthuoc` int DEFAULT NULL,
  `mamausac` int DEFAULT NULL,
  `soluongton` int DEFAULT '0',
  `giaban` decimal(10,2) DEFAULT NULL,
  `ngaytao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `trangthaihoatdongbtsp` enum('hoạt động','không hoạt động') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoạt động',
  PRIMARY KEY (`mabienthe`),
  KEY `masanpham` (`masanpham`),
  KEY `makichthuoc` (`makichthuoc`),
  KEY `mamausac` (`mamausac`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bienthesanpham`
--

INSERT INTO `bienthesanpham` (`mabienthe`, `masanpham`, `makichthuoc`, `mamausac`, `soluongton`, `giaban`, `ngaytao`, `trangthaihoatdongbtsp`) VALUES
(1, 1, 3, 1, 25, 3290000.00, '2026-06-22 08:59:02', 'hoạt động'),
(2, 1, 4, 1, 20, 3290000.00, '2026-06-22 08:59:02', 'hoạt động'),
(3, 1, 5, 2, 18, 3290000.00, '2026-06-22 08:59:02', 'hoạt động'),
(4, 2, 3, 2, 15, 3990000.00, '2026-06-22 08:59:02', 'hoạt động'),
(5, 2, 4, 2, 22, 3990000.00, '2026-06-22 08:59:02', 'hoạt động'),
(6, 2, 5, 1, 17, 3990000.00, '2026-06-22 08:59:02', 'hoạt động'),
(7, 3, 3, 1, 30, 2490000.00, '2026-06-22 08:59:02', 'hoạt động'),
(8, 3, 4, 5, 20, 2490000.00, '2026-06-22 08:59:02', 'hoạt động'),
(9, 4, 3, 2, 18, 2790000.00, '2026-06-22 08:59:02', 'hoạt động'),
(10, 4, 4, 3, 22, 2790000.00, '2026-06-22 08:59:02', 'hoạt động'),
(11, 4, 5, 6, 15, 2790000.00, '2026-06-22 08:59:02', 'hoạt động'),
(12, 5, 4, 4, 12, 3590000.00, '2026-06-22 08:59:02', 'hoạt động'),
(13, 5, 5, 1, 10, 3590000.00, '2026-06-22 08:59:02', 'hoạt động'),
(14, 6, 4, 1, 15, 4190000.00, '2026-06-22 08:59:02', 'hoạt động'),
(15, 6, 5, 2, 12, 4190000.00, '2026-06-22 08:59:02', 'hoạt động'),
(16, 7, 3, 2, 30, 1890000.00, '2026-06-22 08:59:02', 'hoạt động'),
(17, 7, 4, 1, 25, 1890000.00, '2026-06-22 08:59:02', 'hoạt động'),
(18, 8, 4, 1, 22, 1690000.00, '2026-06-22 08:59:02', 'hoạt động'),
(19, 8, 5, 2, 20, 1690000.00, '2026-06-22 08:59:02', 'hoạt động'),
(20, 9, 4, 3, 18, 2890000.00, '2026-06-22 08:59:02', 'hoạt động'),
(21, 9, 5, 1, 15, 2890000.00, '2026-06-22 08:59:02', 'hoạt động'),
(22, 9, 6, 2, 12, 2890000.00, '2026-06-22 08:59:02', 'hoạt động'),
(23, 10, 4, 1, 20, 3190000.00, '2026-06-22 08:59:02', 'hoạt động'),
(24, 10, 5, 3, 18, 3190000.00, '2026-06-22 08:59:02', 'hoạt động'),
(25, 10, 6, 6, 10, 3190000.00, '2026-06-22 08:59:02', 'hoạt động');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietdonhang`
--

DROP TABLE IF EXISTS `chitietdonhang`;
CREATE TABLE IF NOT EXISTS `chitietdonhang` (
  `machitietdonhang` int NOT NULL AUTO_INCREMENT,
  `madonhang` int DEFAULT NULL,
  `mabienthe` int DEFAULT NULL,
  `soluong` int DEFAULT NULL,
  `giagoc` decimal(15,2) DEFAULT NULL,
  `loaikhuyenmai` enum('%','tiền') DEFAULT NULL,
  `giakhuyenmai` decimal(15,2) DEFAULT '0.00',
  `giasaukhuyenmai` decimal(15,2) DEFAULT NULL,
  `ghichu` text,
  `ngaytao` datetime DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`machitietdonhang`),
  KEY `chitietdonhang_ibfk_1` (`madonhang`),
  KEY `chitietdonhang_ibfk_2` (`mabienthe`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmuc`
--

DROP TABLE IF EXISTS `danhmuc`;
CREATE TABLE IF NOT EXISTS `danhmuc` (
  `madanhmuc` int NOT NULL AUTO_INCREMENT,
  `tendanhmuc` varchar(250) NOT NULL,
  `ngaytao` timestamp NOT NULL,
  `gioitinh` enum('Nam','Nu') NOT NULL,
  PRIMARY KEY (`madanhmuc`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmuc`
--

INSERT INTO `danhmuc` (`madanhmuc`, `tendanhmuc`, `ngaytao`, `gioitinh`) VALUES
(1, 'Giày Chạy Bộ Nam', '2026-06-22 08:46:55', 'Nam'),
(2, 'Giày Sneaker Nam', '2026-06-22 08:46:55', 'Nam'),
(3, 'Giày Bóng Rổ Nam', '2026-06-22 08:46:55', 'Nam'),
(4, 'Giày Chạy Bộ Nữ', '2026-06-22 08:46:55', 'Nu'),
(5, 'Giày Sneaker Nữ', '2026-06-22 08:46:55', 'Nu'),
(6, 'Giày Thời Trang Nữ', '2026-06-22 08:46:55', 'Nu');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donhang`
--

DROP TABLE IF EXISTS `donhang`;
CREATE TABLE IF NOT EXISTS `donhang` (
  `madonhang` int NOT NULL AUTO_INCREMENT,
  `app_trans_id` varchar(50) DEFAULT NULL,
  `zalopay_trans_id` varchar(50) DEFAULT NULL,
  `manguoidung` int DEFAULT NULL,
  `tennguoinhan` varchar(250) DEFAULT NULL,
  `sodienthoai` varchar(20) DEFAULT NULL,
  `diachigiao` text,
  `donvivanchuyen` varchar(250) DEFAULT NULL,
  `ngaydukiengiao` datetime DEFAULT NULL,
  `hinhthucthanhtoan` varchar(250) DEFAULT NULL,
  `dathanhtoan` tinyint(1) DEFAULT '0',
  `ngaythanhtoan` datetime DEFAULT NULL,
  `tongtien` decimal(15,2) DEFAULT NULL,
  `phivanchuyen` decimal(15,2) DEFAULT NULL,
  `tongthanhtoan` decimal(15,2) DEFAULT NULL,
  `trangthai` varchar(50) NOT NULL DEFAULT 'chờ xác nhận',
  `ghichu` text,
  `ngaytao` datetime DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lydo_huy` text,
  PRIMARY KEY (`madonhang`),
  KEY `donhang_ibfk_1` (`manguoidung`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hang`
--

DROP TABLE IF EXISTS `hang`;
CREATE TABLE IF NOT EXISTS `hang` (
  `mahang` int NOT NULL AUTO_INCREMENT,
  `tenhang` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `trangthai` enum('hoạt động','không hoạt động') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoạt động',
  `ngaytao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mahang`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hang`
--

INSERT INTO `hang` (`mahang`, `tenhang`, `mota`, `trangthai`, `ngaytao`) VALUES
(1, 'Nike', 'Thương hiệu giày thể thao nổi bật với phong cách năng động, hiện đại.', 'hoạt động', '2026-06-09 06:35:00'),
(2, 'Adidas', 'Thương hiệu giày thể thao quốc tế, phù hợp chạy bộ, lifestyle và training.', 'hoạt động', '2026-06-09 06:35:00'),
(3, 'Puma', 'Thương hiệu giày trẻ trung, mạnh mẽ, phù hợp phong cách streetwear.', 'hoạt động', '2026-06-09 06:35:00'),
(4, 'New Balance', 'Thương hiệu giày nổi bật về sự thoải mái, form dáng basic và dễ phối đồ.', 'hoạt động', '2026-06-09 06:35:00'),
(5, 'Converse', 'Thương hiệu giày casual kinh điển, phù hợp đi học, đi chơi hằng ngày.', 'hoạt động', '2026-06-09 06:35:00'),
(6, 'Vans', 'Thương hiệu giày streetwear phù hợp giới trẻ, phong cách năng động.', 'hoạt động', '2026-06-09 06:35:00'),
(7, 'KICKZONE', 'Dòng sản phẩm giày riêng của cửa hàng KICKZONE.', 'hoạt động', '2026-06-09 06:35:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hinhanh`
--

DROP TABLE IF EXISTS `hinhanh`;
CREATE TABLE IF NOT EXISTS `hinhanh` (
  `mahinhanh` int NOT NULL AUTO_INCREMENT,
  `mabienthe` int DEFAULT NULL,
  `urlhinhanh` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngaytao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stt` int DEFAULT NULL,
  PRIMARY KEY (`mahinhanh`),
  KEY `mabienthe` (`mabienthe`)
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hinhanh`
--

INSERT INTO `hinhanh` (`mahinhanh`, `mabienthe`, `urlhinhanh`, `ngaytao`, `stt`) VALUES
(88, 15, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624402/ShopQuanAo/Nu/SoMi/vhrmxy5rmoezpzlygyoh.webp', '2025-11-20 07:40:03', 1),
(89, 13, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624404/ShopQuanAo/Nu/SoMi/myiougwkeogsh2lsxaih.webp', '2025-11-20 07:40:05', 1),
(90, 15, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624404/ShopQuanAo/Nu/SoMi/myiougwkeogsh2lsxaih.webp', '2025-11-20 07:40:05', 1),
(91, 14, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624405/ShopQuanAo/Nu/SoMi/xbmmgijcclrmah6qqjbe.webp', '2025-11-20 07:40:06', 1),
(92, 16, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624405/ShopQuanAo/Nu/SoMi/xbmmgijcclrmah6qqjbe.webp', '2025-11-20 07:40:06', 1),
(93, 14, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624406/ShopQuanAo/Nu/SoMi/uylcdjypxa6pcxkh4dcb.webp', '2025-11-20 07:40:08', 1),
(94, 16, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624406/ShopQuanAo/Nu/SoMi/uylcdjypxa6pcxkh4dcb.webp', '2025-11-20 07:40:08', 1),
(99, 25, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624409/ShopQuanAo/Nu/Dam/nlj9a8d4pim5o84up5rq.webp', '2025-11-20 07:40:11', 1),
(100, 27, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624409/ShopQuanAo/Nu/Dam/nlj9a8d4pim5o84up5rq.webp', '2025-11-20 07:40:11', 1),
(101, 25, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624411/ShopQuanAo/Nu/Dam/izf43kslu1qqxnfok8bo.webp', '2025-11-20 07:40:11', 1),
(102, 27, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624411/ShopQuanAo/Nu/Dam/izf43kslu1qqxnfok8bo.webp', '2025-11-20 07:40:11', 1),
(103, 26, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624411/ShopQuanAo/Nu/Dam/nczx5mkpbfql6nxgcr58.jpg', '2025-11-20 07:40:12', 1),
(104, 28, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624411/ShopQuanAo/Nu/Dam/nczx5mkpbfql6nxgcr58.jpg', '2025-11-20 07:40:12', 1),
(105, 26, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624412/ShopQuanAo/Nu/Dam/jonfksnzr1ti8cwy86ai.jpg', '2025-11-20 07:40:14', 1),
(106, 28, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1763624412/ShopQuanAo/Nu/Dam/jonfksnzr1ti8cwy86ai.jpg', '2025-11-20 07:40:14', 1),
(127, 38, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767532385/ShopQuanAo/Nam/AoThun/1767532390053.jpg', '2026-01-04 13:13:11', 1),
(128, 38, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767532386/ShopQuanAo/Nam/AoThun/1767532391273.jpg', '2026-01-04 13:13:12', 1),
(129, 39, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767532387/ShopQuanAo/Nam/AoThun/1767532392381.jpg', '2026-01-04 13:13:13', 1),
(130, 39, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767532388/ShopQuanAo/Nam/AoThun/1767532393297.webp', '2026-01-04 13:13:14', 1),
(131, 40, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767532389/ShopQuanAo/Nam/AoThun/1767532394354.jpg', '2026-01-04 13:13:15', 1),
(132, 40, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767532390/ShopQuanAo/Nam/AoThun/1767532395372.jpg', '2026-01-04 13:13:16', 1),
(133, 41, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767532391/ShopQuanAo/Nam/AoThun/1767532396595.jpg', '2026-01-04 13:13:17', 1),
(134, 41, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767532392/ShopQuanAo/Nam/AoThun/1767532397503.webp', '2026-01-04 13:13:18', 1),
(135, 42, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534064/ShopQuanAo/Nu/AoThun/1767534069585.webp', '2026-01-04 13:41:10', 1),
(136, 42, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534065/ShopQuanAo/Nu/AoThun/1767534070622.webp', '2026-01-04 13:41:11', 1),
(137, 43, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534066/ShopQuanAo/Nu/AoThun/1767534071677.webp', '2026-01-04 13:41:12', 1),
(138, 43, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534067/ShopQuanAo/Nu/AoThun/1767534072758.webp', '2026-01-04 13:41:13', 1),
(139, 44, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534068/ShopQuanAo/Nu/AoThun/1767534073755.webp', '2026-01-04 13:41:15', 1),
(140, 44, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534070/ShopQuanAo/Nu/AoThun/1767534075261.jpg', '2026-01-04 13:41:16', 1),
(141, 45, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534070/ShopQuanAo/Nu/AoThun/1767534076117.jpg', '2026-01-04 13:41:16', 1),
(142, 45, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534071/ShopQuanAo/Nu/AoThun/1767534076814.webp', '2026-01-04 13:41:18', 1),
(143, 46, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534073/ShopQuanAo/Nu/AoThun/1767534078898.webp', '2026-01-04 13:41:19', 1),
(144, 46, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534075/ShopQuanAo/Nu/AoThun/1767534079999.webp', '2026-01-04 13:41:20', 1),
(145, 47, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534075/ShopQuanAo/Nu/AoThun/1767534080838.webp', '2026-01-04 13:41:21', 1),
(146, 47, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767534076/ShopQuanAo/Nu/AoThun/1767534081789.webp', '2026-01-04 13:41:22', 1),
(147, 48, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767535744/ShopQuanAo/Nu/Khoac/1767535749142.webp', '2026-01-04 14:09:10', 1),
(148, 48, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767535745/ShopQuanAo/Nu/Khoac/1767535750335.jpg', '2026-01-04 14:09:11', 1),
(149, 49, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767535746/ShopQuanAo/Nu/Khoac/1767535751257.jpg', '2026-01-04 14:09:12', 1),
(150, 49, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767535747/ShopQuanAo/Nu/Khoac/1767535752379.webp', '2026-01-04 14:09:13', 1),
(151, 50, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767535748/ShopQuanAo/Nu/Khoac/1767535753504.webp', '2026-01-04 14:09:14', 1),
(152, 50, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767535749/ShopQuanAo/Nu/Khoac/1767535754446.jpg', '2026-01-04 14:09:15', 1),
(153, 51, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767535750/ShopQuanAo/Nu/Khoac/1767535755323.jpg', '2026-01-04 14:09:16', 1),
(154, 51, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767535751/ShopQuanAo/Nu/Khoac/1767535756281.webp', '2026-01-04 14:09:17', 1),
(155, 52, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767536695/ShopQuanAo/Nam/Khac/1767536700518.jpg', '2026-01-04 14:25:01', 1),
(156, 52, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767536696/ShopQuanAo/Nam/Khac/1767536701440.jpg', '2026-01-04 14:25:02', 1),
(157, 53, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767536697/ShopQuanAo/Nam/Khac/1767536702478.jpg', '2026-01-04 14:25:03', 1),
(158, 53, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767536698/ShopQuanAo/Nam/Khac/1767536703386.jpg', '2026-01-04 14:25:04', 1),
(159, 54, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767536699/ShopQuanAo/Nam/Khac/1767536704316.jpg', '2026-01-04 14:25:05', 1),
(160, 54, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767536700/ShopQuanAo/Nam/Khac/1767536705317.png', '2026-01-04 14:25:06', 1),
(161, 55, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767536701/ShopQuanAo/Nam/Khac/1767536706366.png', '2026-01-04 14:25:07', 1),
(162, 55, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767536702/ShopQuanAo/Nam/Khac/1767536707693.jpg', '2026-01-04 14:25:08', 1),
(163, 56, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767538811/ShopQuanAo/Nam/QuanJean/1767538814941.jpg', '2026-01-04 15:00:17', 1),
(164, 56, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767538813/ShopQuanAo/Nam/QuanJean/1767538817986.jpg', '2026-01-04 15:00:20', 1),
(165, 57, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767538816/ShopQuanAo/Nam/QuanJean/1767538820295.jpg', '2026-01-04 15:00:22', 1),
(166, 57, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767538818/ShopQuanAo/Nam/QuanJean/1767538822555.jpg', '2026-01-04 15:00:24', 1),
(167, 58, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767538820/ShopQuanAo/Nam/QuanJean/1767538824836.webp', '2026-01-04 15:00:29', 1),
(168, 58, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767538825/ShopQuanAo/Nam/QuanJean/1767538829366.webp', '2026-01-04 15:00:31', 1),
(169, 59, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767538827/ShopQuanAo/Nam/QuanJean/1767538831617.webp', '2026-01-04 15:00:33', 1),
(170, 59, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767538829/ShopQuanAo/Nam/QuanJean/1767538833651.webp', '2026-01-04 15:00:35', 1),
(174, 63, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767582705/ShopQuanAo/Nam/AoThun/1767582705821.jpg', '2026-01-05 03:11:46', 1),
(175, 64, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767582755/ShopQuanAo/Nam/AoThun/1767582756413.jpg', '2026-01-05 03:12:37', 1),
(176, 65, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767583122/ShopQuanAo/Nu/AoThun/1767583122440.jpg', '2026-01-05 03:18:43', 1),
(177, 65, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767583123/ShopQuanAo/Nu/AoThun/1767583123934.webp', '2026-01-05 03:18:45', 1),
(178, 66, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767583283/ShopQuanAo/Nu/AoThun/1767583283900.jpg', '2026-01-05 03:21:25', 1),
(179, 66, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1767583284/ShopQuanAo/Nu/AoThun/1767583285061.webp', '2026-01-05 03:21:25', 1),
(180, 67, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1768930706/ShopQuanAo/Nu/SoMi/1768930705292.webp', '2026-01-20 17:38:27', 1),
(181, 67, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1768930708/ShopQuanAo/Nu/SoMi/1768930707466.jpg', '2026-01-20 17:38:28', 1),
(190, 75, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1768931919/ShopQuanAo/Nam/Khoac/1768931918480.jpg', '2026-01-20 17:58:39', 1),
(191, 76, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1768931920/ShopQuanAo/Nam/Khoac/1768931919610.jpg', '2026-01-20 17:58:40', 1),
(192, 76, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1768931921/ShopQuanAo/Nam/Khoac/1768931920645.jpg', '2026-01-20 17:58:41', 1),
(193, 77, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1768931922/ShopQuanAo/Nam/Khoac/1768931921802.jpg', '2026-01-20 17:58:42', 1),
(194, 77, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1768931923/ShopQuanAo/Nam/Khoac/1768931922861.jpg', '2026-01-20 17:58:44', 1),
(195, 78, 'https://res.cloudinary.com/dt3ol8mcr/image/upload/v1768931924/ShopQuanAo/Nam/Khoac/1768931924159.jpg', '2026-01-20 17:58:45', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hoantien`
--

DROP TABLE IF EXISTS `hoantien`;
CREATE TABLE IF NOT EXISTS `hoantien` (
  `mahoantien` int NOT NULL AUTO_INCREMENT,
  `madonhang` int NOT NULL,
  `m_refund_id` varchar(50) NOT NULL,
  `magiaodich_zalopay` bigint DEFAULT NULL,
  `sotienhoan` bigint NOT NULL,
  `trangthai` enum('dang_xu_ly','thanh_cong','that_bai') NOT NULL,
  `phanhoi_zalopay` json DEFAULT NULL,
  `ngaytao` datetime DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`mahoantien`),
  UNIQUE KEY `uq_refund` (`m_refund_id`),
  KEY `idx_donhang` (`madonhang`)
) ENGINE=MyISAM AUTO_INCREMENT=251244 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `kichthuoc`
--

DROP TABLE IF EXISTS `kichthuoc`;
CREATE TABLE IF NOT EXISTS `kichthuoc` (
  `makichthuoc` int NOT NULL AUTO_INCREMENT,
  `tenkichthuoc` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ngaytao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`makichthuoc`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `kichthuoc`
--

INSERT INTO `kichthuoc` (`makichthuoc`, `tenkichthuoc`, `mota`, `ngaytao`) VALUES
(1, '38', 'Size giày 38', '2026-06-22 08:49:45'),
(2, '39', 'Size giày 39', '2026-06-22 08:49:45'),
(3, '40', 'Size giày 40', '2026-06-22 08:49:45'),
(4, '41', 'Size giày 41', '2026-06-22 08:49:45'),
(5, '42', 'Size giày 42', '2026-06-22 08:49:45'),
(6, '43', 'Size giày 43', '2026-06-22 08:49:45'),
(7, '44', 'Size giày 44', '2026-06-22 08:49:45');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mausac`
--

DROP TABLE IF EXISTS `mausac`;
CREATE TABLE IF NOT EXISTS `mausac` (
  `mamausac` int NOT NULL AUTO_INCREMENT,
  `tenmausac` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `hexcode` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaytao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mamausac`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `mausac`
--

INSERT INTO `mausac` (`mamausac`, `tenmausac`, `mota`, `hexcode`, `ngaytao`) VALUES
(1, 'Đen', 'Màu đen cơ bản, dễ phối đồ', '#000000', '2026-06-22 08:48:21'),
(2, 'Trắng', 'Màu trắng tinh tế và hiện đại', '#FFFFFF', '2026-06-22 08:48:21'),
(3, 'Xám', 'Màu xám trung tính', '#808080', '2026-06-22 08:48:21'),
(4, 'Xanh Dương', 'Màu xanh dương năng động', '#1E90FF', '2026-06-22 08:48:21'),
(5, 'Đỏ', 'Màu đỏ nổi bật', '#FF0000', '2026-06-22 08:48:21'),
(6, 'Be', 'Màu be thời trang và thanh lịch', '#F5F5DC', '2026-06-22 08:48:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

DROP TABLE IF EXISTS `nguoidung`;
CREATE TABLE IF NOT EXISTS `nguoidung` (
  `manguoidung` int NOT NULL AUTO_INCREMENT,
  `email` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `matkhau` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoten` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sodienthoai` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diachi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `vaitro` enum('client','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client',
  `trangthai` enum('hoạt động','không hoạt động') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoạt động',
  `ngaytao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resettoken` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thoigianhethan` datetime DEFAULT NULL,
  PRIMARY KEY (`manguoidung`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoidung`
--

INSERT INTO `nguoidung` (`manguoidung`, `email`, `matkhau`, `hoten`, `sodienthoai`, `diachi`, `vaitro`, `trangthai`, `ngaytao`, `ngaycapnhat`, `resettoken`, `thoigianhethan`) VALUES
(2, 'san@gmail.com', '$2b$10$ZdspotbnGKJGrCJmsNaahOqPXfBq/kixvwIrn1qAXFV.1jhWmC96u', NULL, NULL, NULL, 'admin', 'hoạt động', '2025-11-01 17:36:35', '2025-11-02 16:08:58', NULL, NULL),
(3, 'test@gmail.com', '$2b$10$iMZRcvZtF.4z4EhMPmXZ.eX/uP0.qYOUmebNYCxYu89/NH4N3pyUy', 'Nguyễn Văn A', '0909123456', '123 Đường Nguyễn Trãi, Quận 5, TP.HCM', 'client', 'hoạt động', '2025-11-01 17:59:07', '2025-11-28 18:18:14', NULL, NULL),
(5, 'hausaidan451@gmail.com', '$2b$10$F8VeziTXURNt0k5Tk3VnMufYaVGPTDmWtS.UvvjAvgqQOC3S5fnn2', 'Nguyễn Văn A', '0909123456', NULL, 'client', 'hoạt động', '2025-12-24 17:35:46', '2026-01-05 03:00:30', NULL, NULL),
(6, 'st857146@gmail.com', '$2b$10$BYeNmhLesBj3uq/pV/MsM.axInG7zYTNwPhr9TvRw8Bjj1HaKXg3e', 'san', '0382099673', NULL, 'client', 'hoạt động', '2025-12-26 17:00:18', '2025-12-26 17:00:18', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanpham`
--

DROP TABLE IF EXISTS `sanpham`;
CREATE TABLE IF NOT EXISTS `sanpham` (
  `masanpham` int NOT NULL AUTO_INCREMENT,
  `tensanpham` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mahang` int NOT NULL,
  `mota` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `chatlieu` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `kieudang` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `baoquan` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngaytao` timestamp NOT NULL,
  `ngaycapnhat` timestamp NULL DEFAULT NULL,
  `madanhmuc` int NOT NULL,
  `anhdaidien` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`masanpham`),
  KEY `madanhmuc` (`madanhmuc`),
  KEY `mahang` (`mahang`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham`
--

INSERT INTO `sanpham` (`masanpham`, `tensanpham`, `mahang`, `mota`, `chatlieu`, `kieudang`, `baoquan`, `ngaytao`, `ngaycapnhat`, `madanhmuc`, `anhdaidien`) VALUES
(1, 'Nike Air Zoom Pegasus 41', 1, 'Giày chạy bộ êm ái dành cho luyện tập hằng ngày', 'Vải Mesh', 'Chạy bộ', 'Vệ sinh bằng khăn mềm, tránh ngâm nước', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 1, 'pegasus41.jpg'),
(2, 'Adidas Ultraboost Light', 2, 'Giày chạy bộ cao cấp với đệm siêu nhẹ', 'Primeknit', 'Chạy bộ', 'Bảo quản nơi khô ráo', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 1, 'ultraboost_light.jpg'),
(3, 'Puma RS-X Heritage', 3, 'Giày sneaker phong cách trẻ trung', 'Da tổng hợp', 'Sneaker', 'Tránh tiếp xúc nhiệt độ cao', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 2, 'puma_rsx.jpg'),
(4, 'New Balance 530', 4, 'Giày sneaker thời trang được yêu thích', 'Mesh + Da', 'Sneaker', 'Vệ sinh định kỳ bằng bàn chải mềm', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 2, 'nb530.jpg'),
(5, 'Nike Ja 2', 1, 'Giày bóng rổ hỗ trợ bật nhảy tốt', 'Mesh', 'Bóng rổ', 'Bảo quản nơi thoáng mát', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 3, 'nike_ja2.jpg'),
(6, 'Adidas Harden Vol.8', 2, 'Giày bóng rổ hiệu suất cao', 'Mesh + Cao su', 'Bóng rổ', 'Không giặt bằng máy', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 3, 'harden8.jpg'),
(7, 'Converse Chuck Taylor 70', 5, 'Giày cổ cao phong cách cổ điển', 'Canvas', 'Lifestyle', 'Giặt nhẹ bằng tay', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 4, 'chuck70.jpg'),
(8, 'Vans Old Skool', 6, 'Giày thời trang đường phố', 'Canvas', 'Lifestyle', 'Tránh phơi trực tiếp dưới nắng gắt', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 4, 'oldskool.jpg'),
(9, 'Adidas Dropset Trainer', 2, 'Giày tập gym ổn định và chắc chắn', 'Mesh', 'Training', 'Bảo quản nơi khô ráo', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 5, 'dropset.jpg'),
(10, 'Nike Metcon 9', 1, 'Giày tập luyện đa năng cho phòng gym', 'Flyknit', 'Training', 'Vệ sinh bằng khăn ẩm', '2026-06-22 08:43:52', '2026-06-22 08:43:52', 5, 'metcon9.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `voucher`
--

DROP TABLE IF EXISTS `voucher`;
CREATE TABLE IF NOT EXISTS `voucher` (
  `mavoucher` int NOT NULL AUTO_INCREMENT,
  `magiamgia` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mota` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loaikhuyenmai` enum('tiền','%') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tiền',
  `giatrigiam` int DEFAULT NULL,
  `giantoida` int DEFAULT NULL,
  `dontoithieu` int DEFAULT NULL,
  `apdungtoanbo` tinyint(1) DEFAULT NULL,
  `masanpham` int DEFAULT NULL,
  `madanhmuc` int DEFAULT NULL,
  `ngaybatdau` timestamp NULL DEFAULT NULL,
  `ngayketthuc` timestamp NULL DEFAULT NULL,
  `trangthai` enum('hoạt động','hết hạn','vô hiệu') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoạt động',
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mahang` int DEFAULT NULL,
  PRIMARY KEY (`mavoucher`),
  KEY `masanpham` (`masanpham`),
  KEY `madanhmuc` (`madanhmuc`),
  KEY `fk_voucher_hang` (`mahang`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `voucher`
--

INSERT INTO `voucher` (`mavoucher`, `magiamgia`, `mota`, `loaikhuyenmai`, `giatrigiam`, `giantoida`, `dontoithieu`, `apdungtoanbo`, `masanpham`, `madanhmuc`, `ngaybatdau`, `ngayketthuc`, `trangthai`, `ngaytao`, `mahang`) VALUES
(4, 'WELCOME10', 'Giảm 10% cho toàn bộ sản phẩm', '', 10, 200000, 500000, 1, NULL, NULL, '2026-06-22 08:56:32', '2026-07-22 08:56:32', 'hoạt động', '2026-06-22 08:56:32', NULL),
(5, 'NIKE15', 'Giảm 15% cho toàn bộ sản phẩm Nike', '', 15, 300000, 1000000, 0, NULL, NULL, '2026-06-22 08:56:32', '2026-07-12 08:56:32', 'hoạt động', '2026-06-22 08:56:32', 1),
(6, 'ADIDAS200K', 'Giảm trực tiếp 200.000đ cho sản phẩm Adidas', '', 200000, NULL, 2000000, 0, NULL, NULL, '2026-06-22 08:56:32', '2026-07-07 08:56:32', 'hoạt động', '2026-06-22 08:56:32', 2);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD CONSTRAINT `chitietdonhang_ibfk_1` FOREIGN KEY (`madonhang`) REFERENCES `donhang` (`madonhang`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chitietdonhang_ibfk_2` FOREIGN KEY (`mabienthe`) REFERENCES `bienthesanpham` (`mabienthe`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `donhang_ibfk_1` FOREIGN KEY (`manguoidung`) REFERENCES `nguoidung` (`manguoidung`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `voucher`
--
ALTER TABLE `voucher`
  ADD CONSTRAINT `fk_voucher_hang` FOREIGN KEY (`mahang`) REFERENCES `hang` (`mahang`),
  ADD CONSTRAINT `voucher_ibfk_1` FOREIGN KEY (`masanpham`) REFERENCES `sanpham` (`masanpham`),
  ADD CONSTRAINT `voucher_ibfk_2` FOREIGN KEY (`madanhmuc`) REFERENCES `danhmuc` (`madanhmuc`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
