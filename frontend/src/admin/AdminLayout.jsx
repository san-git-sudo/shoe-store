import { useState } from "react";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminProducts from "./AdminProducts.jsx";
import AdminOrders from "./AdminOrders.jsx";
import AdminCustomers from "./AdminCustomers.jsx";
import AdminRevenue from "./AdminRevenue.jsx";
import AdminVouchers from "./AdminVouchers.jsx";
import AdminSizes from "./AdminSizes.jsx";
import AdminColors from "./AdminColors.jsx";
import AdminCates from "./AdminCates.jsx";
import AdminBrands from "./AdminBrands.jsx";

function AdminLayout() {
    const [activePage, setActivePage] = useState("dashboard");

    const pages = {
        dashboard: <AdminDashboard />,
        products: <AdminProducts />,
        sizes: <AdminSizes />,
        colors: <AdminColors />,
        orders: <AdminOrders />,
        customers: <AdminCustomers />,
        revenue: <AdminRevenue />,
        vouchers: <AdminVouchers />,
        cates: <AdminCates />,
        brands: <AdminBrands />,
    };

    return (
        <>
            <AdminSidebar activePage={activePage} setActivePage={setActivePage} />
            {pages[activePage]}
        </>
    );
}

export default AdminLayout;