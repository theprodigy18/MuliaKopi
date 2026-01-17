import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./pages/Home";
import Register from "./pages/Register";
import VerifyAccount from "./pages/VerifyAccount";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import MenuDescription from "./pages/MenuDescription";
import Receipt from "./pages/Receipt";
import ScanMood from "./pages/ScanMood";
import Recommendation from "./pages/Recommendation";
import MenuMobile from "./pages/MenuMobile";
import Cashier from "./pages/admin/Cashier";
import LoginAdmin from "./pages/admin/LoginAdmin";
import OnlineOrder from "./pages/admin/OnlineOrder";
import ReceiptAdmin from "./pages/admin/ReceiptAdmin";
import TransactionHistory from "./pages/admin/TransactionHistory";
import DailyReport from "./pages/admin/DailyReport";
import MenuManagement from "./pages/admin/MenuManagement";
import MenuDescriptionAdmin from "./pages/admin/MenuDescriptionAdmin";
import CreateMenu from "./pages/admin/CreateMenu";
import EditMenu from "./pages/admin/EditMenu";

function App() {

    return (
        <Router>
            <Routes>
                <Route index element={<Home />} />
                <Route path="/menu/:category" element={<Menu />} />
                <Route path="/menu-mobile/:category" element={<MenuMobile />} />
                <Route path="/menu-description/:id" element={<MenuDescription />} />
                {/* Login Only */}
                <Route path="/receipt/:uniqueCode" element={<Receipt />} />
                <Route path="/scan-mood" element={<ScanMood />} />
                <Route path="/recommendation/:scanId" element={<Recommendation />} />
                {/* Auth */}
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/verify/:email/:token" element={<VerifyAccount />} />
                <Route path="/auth/login" element={<Login />} />

                {/* Admin */}
                <Route path="/admin/cashier" element={<Cashier />} />
                <Route path="/admin/online-order" element={<OnlineOrder />} />
                <Route path="/admin/transaction-history" element={<TransactionHistory />} />
                <Route path="/admin/receipt/:uniqueCode" element={<ReceiptAdmin />} />
                <Route path="/admin/daily-report" element={<DailyReport />} />
                <Route path="/admin/menu-management" element={<MenuManagement />} />
                <Route path="/admin/menu-description/:menuId" element={<MenuDescriptionAdmin />} />
                <Route path="/admin/create-menu" element={<CreateMenu />} />
                <Route path="/admin/edit-menu/:menuId" element={<EditMenu />} />


                {/* Admin Auth */}
                <Route path="/admin/auth/login" element={<LoginAdmin />} />
            </Routes>
        </Router>
    )
}

export default App
