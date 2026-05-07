import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import VerifyOtp from "./components/vendor/VerifyOtp";
import AuthPage from "./pages/auth/AuthPage";
import { OnboardingPage } from "./pages/onboarding";
import VendorChat from "./pages/vendorChat/VendorChat";
import Layout from "./layout/Auth";
import DashBoardLayout from "./layout/DashboardLayout";
import logo from "./assets/logo.png";
import sideBarLogo from "./assets/sideBarLogo.png";
import { Toaster } from "react-hot-toast";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProjectManagement from "./components/vendor/ProjectManagement";
import CreateProjectForm from "./components/vendor/CreateProjectForm";
import ViewRequisition from "./components/vendor/ViewRequisition";
import Contracts from "./components/vendor/Contracts";
import ProductManagement from "./components/vendor/ProductManagement";
import CreateProductForm from "./components/vendor/CreateProductForm";
import AddRequisition from "./components/requisition/AddRequisition";
import Dashboard from "./components/Dashboard";
import VendorContact from "./pages/vendorContract/VendorContract";
import HomePage from "./components/landingPages/HomePage";
import RequisitionsManagement from "./components/vendor/RequisitionsManagement";
import VendorManagement from "./components/vendor/VendorManagement";
import VendorFormContainer from "./components/vendorForm/VendorFormContainer";
import UserInfo from "./components/settings/UserInfo";
import CreateUserForm from "./components/user/AddUser";
import UserManagement from "./components/user/UserManagement";
import Roles from "./components/roles/Roles";
import GroupSummary from "./pages/GroupSummary";
import NegotiationRoom from "./pages/chatbot/NegotiationRoom";
import NewDealPageWrapper from "./pages/chatbot/NewDealPageWrapper";
import ConversationRoom from "./pages/chatbot/ConversationRoom";
import SummaryPage from "./pages/chatbot/SummaryPage";
import RequisitionListPage from "./pages/chatbot/RequisitionListPage";
import RequisitionDealsPage from "./pages/chatbot/RequisitionDealsPage";
import ArchivedRequisitionsPage from "./pages/chatbot/ArchivedRequisitionsPage";
import ArchivedDealsForRequisitionPage from "./pages/chatbot/ArchivedDealsForRequisitionPage";
import Feedback from "./pages/Feedback";
import {
  BidAnalysisListPage,
  BidAnalysisDetailPage,
} from "./pages/bidAnalysis";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public vendor chat route (no auth required) */}
          <Route path="/vendor-chat/:uniqueToken" element={<VendorChat />} />
          <Route path="/" element={<HomePage />} />

          <Route
            path="/verifyOtp"
            element={
              <Layout logo={logo}>
                <VerifyOtp />
              </Layout>
            }
          />
          <Route
            path="/auth"
            element={
              <Layout logo={logo}>
                <AuthPage />
              </Layout>
            }
          />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/forgot-password"
            element={
              <Layout logo={logo}>
                <ForgotPassword />
              </Layout>
            }
          />
          <Route
            path="/reset-password/:id"
            element={
              <Layout logo={logo}>
                <ResetPassword />
              </Layout>
            }
          />
          <Route
            path="/vendor-contract/:id"
            element={
              <Layout logo={logo} className="max-w-lg flex justify-center">
                <center>
                  <VendorContact />
                </center>
              </Layout>
            }
          />
          <Route
            path="/product-management"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<ProductManagement />} />

            <Route path="createproductform" element={<CreateProductForm />} />
            <Route path="editproductform/:id" element={<CreateProductForm />} />
          </Route>

          <Route
            path="/dashboard"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<Dashboard />} />
          </Route>

          <Route
            path="/project-management"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<ProjectManagement />} />
            <Route path="create-project" element={<CreateProjectForm />} />
            <Route path="editprojectform/:id" element={<CreateProjectForm />} />
          </Route>
          <Route
            path="/requisition-management"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route path="requisition/contract" element={<Contracts />} />

            <Route path="create-requisition" element={<AddRequisition />} />
            <Route path="edit-requisition/:id" element={<AddRequisition />} />
            <Route path="requisition" element={<ViewRequisition />} />

            <Route index element={<RequisitionsManagement />} />
            <Route path="requisition" element={<ViewRequisition />} />
            <Route path="create-project" element={<CreateProjectForm />} />
            <Route path="editproductform/:id" element={<CreateProjectForm />} />
          </Route>

          <Route
            path="/vendor-management"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<VendorManagement />} />
            <Route path="create-vendor/" element={<VendorFormContainer />} />
            <Route path="edit-vendor/:id" element={<VendorFormContainer />} />
            <Route path="add-vendor/:id" element={<VendorFormContainer />} />
          </Route>

          <Route
            path="/user-management"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<UserManagement />} />
            <Route path="create-user/" element={<CreateUserForm />} />
            <Route path="edit-user/:id" element={<CreateUserForm />} />
            <Route path="edit-roles/" element={<Roles />} />
          </Route>
          <Route
            path="/group-summary"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<GroupSummary />} />
          </Route>
          <Route
            path="/setting"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<UserInfo />} />
          </Route>

          {/* Feedback Route */}
          <Route
            path="/feedback"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<Feedback />} />
          </Route>

          {/* Bid Analysis Routes */}
          <Route
            path="/bid-analysis"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<BidAnalysisListPage />} />
            <Route
              path="requisitions/:requisitionId"
              element={<BidAnalysisDetailPage />}
            />
          </Route>

          {/* Chatbot Routes */}
          <Route
            path="/chatbot"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            {/* Main page: Requisition list at /chatbot/requisitions */}
            <Route path="requisitions" element={<RequisitionListPage />} />
            {/* Requisition deals page (Level 2) */}
            <Route
              path="requisitions/:requisitionId"
              element={<RequisitionDealsPage />}
            />
            {/* Archived requisitions and deals */}
            <Route
              path="requisitions/archived"
              element={<ArchivedRequisitionsPage />}
            />
            <Route
              path="requisitions/:requisitionId/archived"
              element={<ArchivedDealsForRequisitionPage />}
            />
            {/* Deal management - create new deal (with optional requisitionId query param) */}
            <Route
              path="requisitions/deals/new"
              element={<NewDealPageWrapper />}
            />
            {/* Nested URL structure for deals (hierarchical pattern) */}
            <Route
              path="requisitions/:rfqId/vendors/:vendorId/deals/:dealId"
              element={<NegotiationRoom />}
            />
            <Route
              path="requisitions/:rfqId/vendors/:vendorId/deals/:dealId/conversation"
              element={<ConversationRoom />}
            />
            <Route
              path="requisitions/:rfqId/vendors/:vendorId/deals/:dealId/summary"
              element={<SummaryPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
