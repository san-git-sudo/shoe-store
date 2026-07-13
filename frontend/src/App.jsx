import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import Cart from "./pages/Cart.jsx";
import Vouchers from "./pages/Vouchers.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import "./App.css";
function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="/orders"
          element={
            <>
              <Navbar />
              <OrderHistory />
              <Footer />
            </>
          }
        />
        <Route
          path="/vouchers"
          element={
            <>
              <Navbar />
              <Vouchers />
              <Footer />
            </>
          }
        />
        <Route
          path="/cart"
          element={
            <>
              <Navbar />
              <Cart />
              <Footer />
            </>
          }
        />
        <Route
          path="/search"
          element={
            <>
              <Navbar />
              <SearchPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <Auth />
              <Footer />
            </>
          }
        />

        <Route
          path="/product/:id"
          element={
            <>
              <Navbar />
              <ProductDetail />
              <Footer />
            </>
          }
        />

        <Route path="/admin" element={<AdminLayout />} />
      </Routes>
    </>
  );
}

export default App;