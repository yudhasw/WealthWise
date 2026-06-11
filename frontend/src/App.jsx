import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import TransactionsPage from "./pages/transactions/TransactionPage";
import AddTransactionsPage from "./pages/transactions/AddTransactionPage";
import EditTransaction from "./pages/transactions/EditTranscation";
import ProfilePage from "./pages/profile/ProfilePage";
import StatisticsPage from "./pages/statistics/StatisticsPage";
import SmartPlanning from "./pages/smartplanning/Smartplanning";
import AddNewGoalPage from "./pages/smartplanning/AddNewGoalPage";
import EditGoalPage from "./pages/smartplanning/EditGoalPage";
import ViewAllGoals from "./pages/smartplanning/ViewAllGoals";
import AddCategoryPage from "./pages/categories/AddCategoryPage";
import EditCategoryPage from "./pages/categories/EditCategoryPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import FinancialHealth from "./pages/financial-health/FinancialHealthPage";
import AccountPage from "./pages/account/AccountPage";
import AddAccountPage from "./pages/account/AddAccountPage";
import EditAccountPage from "./pages/account/EditAccountPage";
import NotificationPage from "./pages/notification/NotificationPage";
import LandingPage from "./pages/landingpage/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landingpage" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/add" element={<AddTransactionsPage />} />
        <Route path="/transactions/edit/:id" element={<EditTransaction />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/categories/add" element={<AddCategoryPage />} />
        <Route path="/categories/edit/:id" element={<EditCategoryPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/smart-planning" element={<SmartPlanning />} />
        <Route path="/smart-planning/add-goal" element={<AddNewGoalPage />} />
        <Route path="/smart-planning/edit/:id" element={<EditGoalPage />} />
        <Route path="/smart-planning/active-goals" element={<ViewAllGoals />} />
        <Route path="/financial-health" element={<FinancialHealth />} />
        <Route path="/accounts" element={<AccountPage />} />
        <Route path="/accounts/add" element={<AddAccountPage />} />
        <Route path="/accounts/edit/:id" element={<EditAccountPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/smart-planning/new-goal" element={<AddNewGoalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
