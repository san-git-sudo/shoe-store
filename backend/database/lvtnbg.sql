-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th7 15, 2026 lúc 04:17 PM
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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bienthesanpham`
--

INSERT INTO `bienthesanpham` (`mabienthe`, `masanpham`, `makichthuoc`, `mamausac`, `soluongton`, `giaban`, `ngaytao`, `trangthaihoatdongbtsp`) VALUES
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
(25, 10, 6, 6, 10, 3190000.00, '2026-06-22 08:59:02', 'hoạt động'),
(26, 31, 1, 1, 50, 2500000.00, '2026-07-15 05:50:59', 'hoạt động'),
(34, 36, 1, 5, 50, 500000.00, '2026-07-15 07:16:06', 'hoạt động'),
(35, 36, 2, 1, 50, 500000.00, '2026-07-15 07:16:06', 'hoạt động'),
(36, 36, 1, 3, 50, 500000.00, '2026-07-15 07:16:06', 'hoạt động'),
(37, 37, 1, 1, 50, 500000.00, '2026-07-15 08:00:58', 'hoạt động'),
(38, 37, 1, 2, 50, 500000.00, '2026-07-15 08:00:58', 'hoạt động');

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
  `gioitinh` enum('Nam','Nữ') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`madanhmuc`),
  UNIQUE KEY `uq_danhmuc_tendanhmuc` (`tendanhmuc`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmuc`
--

INSERT INTO `danhmuc` (`madanhmuc`, `tendanhmuc`, `ngaytao`, `gioitinh`) VALUES
(1, 'Giày Chạy Bộ Nam', '2026-06-22 08:46:55', 'Nam'),
(2, 'Giày Sneaker Nam', '2026-06-22 08:46:55', 'Nam'),
(3, 'Giày Bóng Rổ Nam', '2026-06-22 08:46:55', 'Nam'),
(4, 'Giày Chạy Bộ Nữ', '2026-06-22 08:46:55', 'Nữ'),
(5, 'Giày Sneaker Nữ', '2026-06-22 08:46:55', 'Nữ'),
(6, 'Giày Thời Trang Nữ', '2026-06-22 08:46:55', 'Nữ');

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
  PRIMARY KEY (`mahang`),
  UNIQUE KEY `uq_hang_tenhang` (`tenhang`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hinhanh`
--

INSERT INTO `hinhanh` (`mahinhanh`, `mabienthe`, `urlhinhanh`, `ngaytao`, `stt`) VALUES
(1, 23, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783780620/shoe-store/products/vf2loyq9iwdliixgadef.webp', '2026-07-11 14:47:07', 1),
(2, 23, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783780621/shoe-store/products/s2m6ha6tltcgmdnxl4hc.webp', '2026-07-11 14:47:07', 2),
(3, 23, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783780620/shoe-store/products/uiqrergveifr3glitl4v.webp', '2026-07-11 14:47:07', 3),
(4, 23, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783780621/shoe-store/products/peioa9ya2kq4lwjdptby.webp', '2026-07-11 14:47:07', 4),
(5, 24, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783781566/shoe-store/products/z88eoxfy07kxsf6hke1k.png', '2026-07-11 14:54:04', 1),
(6, 24, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783781569/shoe-store/products/d2ix0sfwqeupvfigfocg.jpg', '2026-07-11 14:54:04', 2),
(7, 24, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783781569/shoe-store/products/glpknnbwfdlbgctsumeo.png', '2026-07-11 14:54:04', 3),
(8, 24, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783781572/shoe-store/products/hiedws7ivhlgxzlzjt8c.jpg', '2026-07-11 14:54:04', 4),
(9, 25, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783781789/shoe-store/products/bjnurblw1kb4brd4vmz1.png', '2026-07-11 14:57:39', 1),
(10, 25, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783781792/shoe-store/products/uvrlbfzwohzxih7ba3te.jpg', '2026-07-11 14:57:39', 2),
(11, 25, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783781792/shoe-store/products/fdy0oxydau7e189zccmm.png', '2026-07-11 14:57:39', 3),
(12, 25, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783781795/shoe-store/products/bwseapbabwsb02ljwtyb.png', '2026-07-11 14:57:39', 4),
(13, 20, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783782954/shoe-store/products/mvbzrnrb8iyy6xrx23rr.png', '2026-07-11 15:18:45', 1),
(14, 20, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783782956/shoe-store/products/cbbsjokaprqqbcwouwtp.png', '2026-07-11 15:18:45', 2),
(15, 20, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783782956/shoe-store/products/timtgke1ngrzahchyzbv.png', '2026-07-11 15:18:45', 3),
(16, 21, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783233/shoe-store/products/f6cioharu7n1t2ndb8cj.webp', '2026-07-11 15:21:16', 1),
(17, 21, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783233/shoe-store/products/wpvietlpyes62ruxuxyo.webp', '2026-07-11 15:21:16', 2),
(18, 21, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783233/shoe-store/products/uk8e4hwt8ztgbhketmqq.webp', '2026-07-11 15:21:16', 3),
(19, 22, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783354/shoe-store/products/rb4zjle8ftgxwbw7hfne.png', '2026-07-11 15:23:17', 1),
(20, 22, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783356/shoe-store/products/d0sd3s64biqha32avxwq.png', '2026-07-11 15:23:17', 2),
(21, 22, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783356/shoe-store/products/wr9pzcscgygtera1omwz.png', '2026-07-11 15:23:17', 3),
(22, 18, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783542/shoe-store/products/c99ajgenclz6zu51zxqs.webp', '2026-07-11 15:26:28', 1),
(23, 18, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783542/shoe-store/products/btqgs0vakzf4stcgkuse.webp', '2026-07-11 15:26:28', 2),
(24, 18, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783541/shoe-store/products/ijoyfhmorjvv7embneaa.webp', '2026-07-11 15:26:28', 3),
(25, 19, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783661/shoe-store/products/wmsh9igu3rztqmzamifi.webp', '2026-07-11 15:28:55', 1),
(26, 19, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783660/shoe-store/products/vvtes4rhkuuauxc8w6vf.webp', '2026-07-11 15:28:55', 2),
(27, 19, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783660/shoe-store/products/zslkq9u2trbj0msrdww6.webp', '2026-07-11 15:28:55', 3),
(28, 16, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783839/shoe-store/products/jjookutnu5lmnpuy9kl0.webp', '2026-07-11 15:31:30', 1),
(29, 16, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783839/shoe-store/products/pyr0oonl14mnzijxqwat.webp', '2026-07-11 15:31:30', 2),
(30, 16, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783839/shoe-store/products/qm9jrdpiiuxt0uehisop.webp', '2026-07-11 15:31:30', 3),
(31, 17, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783992/shoe-store/products/jtny1ntkvhvdhddgtafh.jpg', '2026-07-11 15:33:52', 1),
(32, 17, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783994/shoe-store/products/fjgmrglzvamkyyec1ugy.png', '2026-07-11 15:33:52', 2),
(33, 17, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783783994/shoe-store/products/heksni1gcuzlqbah86yi.png', '2026-07-11 15:33:52', 3),
(34, 14, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784418/shoe-store/products/rnpieyq0ypofdgymygua.png', '2026-07-11 15:41:05', 1),
(35, 14, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784419/shoe-store/products/vcj7oplxnjkijv9a0qpy.png', '2026-07-11 15:41:05', 2),
(36, 14, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784419/shoe-store/products/dzwdr9p1ycp3x9zk4dql.png', '2026-07-11 15:41:05', 3),
(37, 15, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784559/shoe-store/products/hhj52pkcuhlexmsicvr8.png', '2026-07-11 15:43:29', 1),
(38, 15, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784562/shoe-store/products/vgg9y1vc3afxdirhxxed.png', '2026-07-11 15:43:29', 2),
(39, 15, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784563/shoe-store/products/szdupjsnubouxr1s39vw.png', '2026-07-11 15:43:29', 3),
(40, 12, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784699/shoe-store/products/efrd5kd4mgrfcxavvi6a.webp', '2026-07-11 15:46:14', 1),
(41, 12, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784699/shoe-store/products/vvpybozyo0kfyuty7r1g.webp', '2026-07-11 15:46:14', 2),
(42, 12, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784699/shoe-store/products/zhqd8rbeedgydiadeynx.webp', '2026-07-11 15:46:14', 3),
(43, 13, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784855/shoe-store/products/ws3ilqjj8g2mpp4m6hpu.webp', '2026-07-11 15:48:18', 1),
(44, 13, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784856/shoe-store/products/nls9152mgzk25psefdyl.webp', '2026-07-11 15:48:18', 2),
(45, 13, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783784856/shoe-store/products/my3k5b7i7rq21ccw7jwr.webp', '2026-07-11 15:48:18', 3),
(46, 9, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785036/shoe-store/products/a3wiqa3arh1zrk99i6f1.webp', '2026-07-11 15:51:43', 1),
(47, 9, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785036/shoe-store/products/bm4bfyxq7ltfenkploja.webp', '2026-07-11 15:51:43', 2),
(48, 9, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785037/shoe-store/products/h5301cgolzrqw7kfdlan.webp', '2026-07-11 15:51:43', 3),
(49, 10, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785253/shoe-store/products/pklhpfaqm8nvbswjnavm.webp', '2026-07-11 15:54:59', 1),
(50, 10, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785253/shoe-store/products/oamvcrpio3c7mhtcyv9b.webp', '2026-07-11 15:54:59', 2),
(51, 10, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785253/shoe-store/products/l8hqau7qtnffc8qmn0h5.webp', '2026-07-11 15:54:59', 3),
(52, 11, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785388/shoe-store/products/ti4u6cqla3ejnoflco6p.png', '2026-07-11 15:57:23', 1),
(53, 11, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785397/shoe-store/products/tmnrwn3emu9ak5ry3pip.png', '2026-07-11 15:57:23', 2),
(54, 11, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785394/shoe-store/products/hnbffjgjpjy70zpmm2gh.png', '2026-07-11 15:57:23', 3),
(55, 7, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785571/shoe-store/products/p4olakgzyfn8rqbxzt1b.webp', '2026-07-11 16:00:05', 1),
(56, 7, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785570/shoe-store/products/qmyiqwlbzx8lldgvybgk.webp', '2026-07-11 16:00:05', 2),
(57, 7, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785571/shoe-store/products/kzndtftjwnqxqvznine6.webp', '2026-07-11 16:00:05', 3),
(58, 8, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785681/shoe-store/products/qagrbf39bbhbw7whczfk.webp', '2026-07-11 16:02:49', 1),
(59, 8, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785682/shoe-store/products/nvp3sehjqlr7lg0rcup5.webp', '2026-07-11 16:02:49', 2),
(60, 8, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785682/shoe-store/products/ir9mzoawops0dzwoknuw.webp', '2026-07-11 16:02:49', 3),
(61, 4, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785863/shoe-store/products/ijw8t6gnku2jhdbuvtu3.webp', '2026-07-11 16:05:39', 1),
(62, 4, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785864/shoe-store/products/wqbpjuasd6cxsbuxtm44.webp', '2026-07-11 16:05:39', 2),
(63, 4, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785863/shoe-store/products/veqxorphdmii8bdgiitd.webp', '2026-07-11 16:05:39', 3),
(64, 5, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785863/shoe-store/products/ijw8t6gnku2jhdbuvtu3.webp', '2026-07-11 16:06:33', 1),
(65, 5, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785864/shoe-store/products/wqbpjuasd6cxsbuxtm44.webp', '2026-07-11 16:06:33', 2),
(66, 5, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783785863/shoe-store/products/veqxorphdmii8bdgiitd.webp', '2026-07-11 16:06:33', 3),
(67, 6, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783786075/shoe-store/products/lyd09zfzg3yfdxe7vbdm.webp', '2026-07-11 16:08:31', 1),
(68, 6, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783786075/shoe-store/products/gt3s6vtaqqds1wrnonkh.webp', '2026-07-11 16:08:31', 2),
(69, 6, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783786075/shoe-store/products/tx70idon6c25rntqjklb.webp', '2026-07-11 16:08:31', 3),
(79, 26, 'https://res.cloudinary.com/.../af1-black-side.jpg', '2026-07-15 05:50:59', 1),
(80, 26, 'https://res.cloudinary.com/.../af1-black-back.jpg', '2026-07-15 05:50:59', 2),
(93, 36, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784099765/shoe-store/products/jgtpuqykqmdgop2d1ygz.png', '2026-07-15 07:16:06', 1),
(94, 36, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784099765/shoe-store/products/vw2hbhnuwdulrbkqq1tx.png', '2026-07-15 07:16:06', 2),
(95, 36, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784099764/shoe-store/products/mhh3x3ehortty6hudhx4.png', '2026-07-15 07:16:06', 3),
(96, 37, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784102453/shoe-store/products/opjglv31xkiyd6mcdwfh.webp', '2026-07-15 08:00:58', 1),
(97, 37, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784102454/shoe-store/products/lhljeiarz9nz06bob61m.webp', '2026-07-15 08:00:58', 2),
(98, 37, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784102454/shoe-store/products/ak4t9dxozxm4m9g43wji.webp', '2026-07-15 08:00:58', 3),
(99, 38, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784102456/shoe-store/products/prplpdefiqu3yd2wp0tz.png', '2026-07-15 08:00:58', 1),
(100, 38, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784102455/shoe-store/products/x69gkuxzsvqog2yybd4n.png', '2026-07-15 08:00:58', 2),
(101, 38, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784102455/shoe-store/products/ied9nzomidqplracx6cu.png', '2026-07-15 08:00:58', 3);

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
  PRIMARY KEY (`makichthuoc`),
  UNIQUE KEY `uq_kichthuoc_tenkichthuoc` (`tenkichthuoc`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(7, '44', 'Size giày 44', '2026-06-22 08:49:45'),
(9, '44.5', 'Size giày 44.5', '2026-07-15 14:38:39');

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
  PRIMARY KEY (`mamausac`),
  UNIQUE KEY `uq_mausac_tenmausac` (`tenmausac`),
  UNIQUE KEY `uq_mausac_hexcode` (`hexcode`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `mausac`
--

INSERT INTO `mausac` (`mamausac`, `tenmausac`, `mota`, `hexcode`, `ngaytao`) VALUES
(1, 'Đen', 'Màu đen cơ bản, dễ phối đồ', '#000000', '2026-06-22 08:48:21'),
(2, 'Trắng', 'Màu trắng tinh tế và hiện đại', '#FFFFFF', '2026-06-22 08:48:21'),
(3, 'Xám', 'Màu xám trung tính', '#808080', '2026-06-22 08:48:21'),
(4, 'Xanh Dương', 'Màu xanh dương năng động', '#1E90FF', '2026-06-22 08:48:21'),
(5, 'Đỏ', 'Màu đỏ nổi bật', '#FF0000', '2026-06-22 08:48:21'),
(6, 'Be', 'Màu be thời trang và thanh lịch', '#F5F5DC', '2026-06-22 08:48:21'),
(18, 'Xanh lá cây', 'Màu xanh lá cây trẻ trung , năng động', '#14E12C', '2026-07-15 14:55:36');

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoidung`
--

INSERT INTO `nguoidung` (`manguoidung`, `email`, `matkhau`, `hoten`, `sodienthoai`, `diachi`, `vaitro`, `trangthai`, `ngaytao`, `ngaycapnhat`, `resettoken`, `thoigianhethan`) VALUES
(2, 'san@gmail.com', '$2b$10$ZdspotbnGKJGrCJmsNaahOqPXfBq/kixvwIrn1qAXFV.1jhWmC96u', NULL, NULL, NULL, 'admin', 'hoạt động', '2025-11-01 17:36:35', '2025-11-02 16:08:58', NULL, NULL),
(3, 'test@gmail.com', '$2b$10$iMZRcvZtF.4z4EhMPmXZ.eX/uP0.qYOUmebNYCxYu89/NH4N3pyUy', 'Nguyễn Văn A', '0909123456', '123 Đường Nguyễn Trãi, Quận 5, TP.HCM', 'client', 'hoạt động', '2025-11-01 17:59:07', '2025-11-28 18:18:14', NULL, NULL),
(5, 'hausaidan451@gmail.com', '$2b$10$F8VeziTXURNt0k5Tk3VnMufYaVGPTDmWtS.UvvjAvgqQOC3S5fnn2', 'Nguyễn Văn A', '0909123456', NULL, 'client', 'hoạt động', '2025-12-24 17:35:46', '2026-01-05 03:00:30', NULL, NULL),
(7, 'vana@gmail.com', '$2b$10$Ov0AiboiC4oNFUX4dJiO2ejZAw6I9NSElz3CGJm5Zl7aect3lJa7e', 'Nguyễn Văn A', '0912345678', 'HCM', 'client', 'hoạt động', '2026-07-14 14:21:18', '2026-07-14 14:21:18', NULL, NULL),
(8, 'abc@gmail.com', '$2b$10$ZPe8wvqeRinW8Q5KzqgLu.J5hMqsS/tYhLrz5ZDY6ajG6NJKj5g0u', 'Nguyễn Văn A', NULL, NULL, 'client', 'hoạt động', '2026-07-14 14:22:31', '2026-07-14 14:22:31', NULL, NULL),
(9, 'st857146@gmail.com', '$2b$10$yy/VloGOaehPc5YM7h8SbOhWZK88FIbR9B8SPnJkxsqhykCoZ1OD6', 'Thanh San', '0912345678', 'TP. Hồ Chí Minh', 'client', 'hoạt động', '2026-07-14 15:57:32', '2026-07-14 17:32:12', NULL, NULL),
(10, 'hausaidan65@gmail.com', '$2b$10$QpCewXJ5ifxcAsT9Fy8jCOrm9TrbP5u40jWVA0aVxegg0HCp2BfYu', 'Thanh San', '0385225227', '320 Hưng Phú', 'client', 'hoạt động', '2026-07-14 17:49:07', '2026-07-14 17:49:44', NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham`
--

INSERT INTO `sanpham` (`masanpham`, `tensanpham`, `mahang`, `mota`, `chatlieu`, `kieudang`, `baoquan`, `ngaytao`, `ngaycapnhat`, `madanhmuc`, `anhdaidien`) VALUES
(2, 'Adidas Ultraboost Light', 2, 'Giày chạy bộ cao cấp với đệm siêu nhẹ', 'Primeknit', 'Chạy bộ', 'Bảo quản nơi khô ráo', '2026-07-11 13:04:37', '2026-06-22 08:43:52', 1, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775058/shoe-store/products/icpk6nmqon4vddivkau5.webp'),
(3, 'Puma RS-X Heritage', 3, 'Giày sneaker phong cách trẻ trung', 'Da tổng hợp', 'Sneaker', 'Tránh tiếp xúc nhiệt độ cao', '2026-07-11 13:06:43', '2026-06-22 08:43:52', 2, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775164/shoe-store/products/zwe82y37thtllm5mnhwm.webp'),
(4, 'New Balance 530', 4, 'Giày sneaker thời trang được yêu thích', 'Mesh + Da', 'Sneaker', 'Vệ sinh định kỳ bằng bàn chải mềm', '2026-07-11 13:07:52', '2026-06-22 08:43:52', 2, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775258/shoe-store/products/lgumgufs3ltvhnwifdjy.webp'),
(5, 'Nike Ja 2', 1, 'Giày bóng rổ hỗ trợ bật nhảy tốt', 'Mesh', 'Bóng rổ', 'Bảo quản nơi thoáng mát', '2026-07-11 13:09:06', '2026-06-22 08:43:52', 3, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775332/shoe-store/products/djk2b5r1xnpfjvqmkmth.webp'),
(6, 'Adidas Harden Vol.8', 2, 'Giày bóng rổ hiệu suất cao', 'Mesh + Cao su', 'Bóng rổ', 'Không giặt bằng máy', '2026-07-11 13:10:18', '2026-06-22 08:43:52', 3, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775392/shoe-store/products/ix3dhm8amnxpoiqqyjua.png'),
(7, 'Converse Chuck Taylor 70', 5, 'Giày cổ cao phong cách cổ điển', 'Canvas', 'Lifestyle', 'Giặt nhẹ bằng tay', '2026-07-11 13:12:19', '2026-06-22 08:43:52', 4, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775527/shoe-store/products/ptnvybiapr9kc5dbqxhh.webp'),
(8, 'Vans Old Skool', 6, 'Giày thời trang đường phố', 'Canvas', 'Lifestyle', 'Tránh phơi trực tiếp dưới nắng gắt', '2026-07-11 13:13:05', '2026-06-22 08:43:52', 4, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775577/shoe-store/products/zuxctxodjprhel5wrzsd.webp'),
(9, 'Adidas Dropset Trainer', 2, 'Giày tập gym ổn định và chắc chắn', 'Mesh', 'Training', 'Bảo quản nơi khô ráo', '2026-07-11 13:14:02', '2026-06-22 08:43:52', 5, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775633/shoe-store/products/swwdzext3isfrxbacl4m.jpg'),
(10, 'Nike Metcon 9', 1, 'Giày tập luyện đa năng cho phòng gym', 'Flyknit', 'Training', 'Vệ sinh bằng khăn ẩm', '2026-07-11 13:15:13', '2026-06-22 08:43:52', 5, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775706/shoe-store/products/zgxfeb04oh2knlqqfg1d.webp'),
(31, 'Nike Air Force 1 Black', 1, 'Giày thể thao Nike Air Force 1 chính hãng, thiết kế sang trọng.', 'Da cao cấp', 'Cổ thấp', 'Tránh tiếp xúc nước trực tiếp, lau bằng khăn ẩm.', '2026-07-15 06:19:20', NULL, 1, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1783775058/shoe-store/products/icpk6nmqon4vddivkau5.webp'),
(36, 'PUMA VIP', 3, 'PUMA VIP', 'Cotton 100%', 'nhỏ gọn', 'giặt nhẹ, để nơi thoáng mát', '0000-00-00 00:00:00', NULL, 3, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784099667/shoe-store/products/dwazkpwg8junpdnuaryk.webp'),
(37, 'New KickZone', 7, 'New KickZone phù hợp cho mọi lứa tuổi', 'Cotton 100%', 'nhỏ gọn', 'giặt nhẹ, để nơi thoáng mát', '0000-00-00 00:00:00', NULL, 3, 'https://res.cloudinary.com/dii9or3qb/image/upload/v1784102452/shoe-store/products/hodbe09svfs4n1o3qxyp.webp');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `voucher`
--

DROP TABLE IF EXISTS `voucher`;
CREATE TABLE IF NOT EXISTS `voucher` (
  `mavoucher` int NOT NULL AUTO_INCREMENT,
  `magiamgia` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mota` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loaikhuyenmai` enum('percent','fixed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percent',
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
  UNIQUE KEY `uq_voucher_magiamgia` (`magiamgia`),
  KEY `masanpham` (`masanpham`),
  KEY `madanhmuc` (`madanhmuc`),
  KEY `fk_voucher_hang` (`mahang`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `voucher`
--

INSERT INTO `voucher` (`mavoucher`, `magiamgia`, `mota`, `loaikhuyenmai`, `giatrigiam`, `giantoida`, `dontoithieu`, `apdungtoanbo`, `masanpham`, `madanhmuc`, `ngaybatdau`, `ngayketthuc`, `trangthai`, `ngaytao`, `mahang`) VALUES
(5, 'NIKE15', 'Giảm 15% cho toàn bộ sản phẩm Nike', 'percent', 15, 300000, 1000000, 0, NULL, NULL, '2026-06-22 08:56:32', '2026-07-12 08:56:32', 'hoạt động', '2026-06-22 08:56:32', 1),
(6, 'ADIDAS200K', 'Giảm trực tiếp 200.000đ cho sản phẩm Adidas', 'fixed', 200000, NULL, 2000000, 0, NULL, NULL, '2026-06-22 08:56:32', '2026-07-07 08:56:32', 'hoạt động', '2026-06-22 08:56:32', 2),
(7, 'SALE10', 'Giảm 10% toàn bộ cửa hàng', 'percent', 10, 100000, 500000, 1, NULL, NULL, '2026-07-14 17:00:00', '2026-08-15 16:59:59', 'hoạt động', '2026-07-15 13:18:12', NULL),
(9, 'SALE30', 'Giảm giá 30% cho các sản phẩm là giày bóng rổ nam', 'percent', 30, 500000, 500000, 0, NULL, 3, '2026-07-15 13:33:00', '2026-12-18 13:33:00', 'hoạt động', '2026-07-15 13:34:05', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `xacthucemail`
--

DROP TABLE IF EXISTS `xacthucemail`;
CREATE TABLE IF NOT EXISTS `xacthucemail` (
  `maxacthuc` int NOT NULL AUTO_INCREMENT,
  `email` varchar(250) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `hoten` varchar(250) NOT NULL,
  `matkhau` varchar(250) NOT NULL,
  `sodienthoai` varchar(20) DEFAULT NULL,
  `diachi` text,
  `thoigianhethan` datetime NOT NULL,
  `ngaytao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`maxacthuc`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
