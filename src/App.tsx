import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import SuccessMessage from "./components/vendor/SuccessMessage";
import VerifyOtp from "./components/vendor/VerifyOtp";
import SignUp from "./pages/Auth/SignUp";
import VendorChat from "./pages/vendorChat/VendorChat";
import Layout from "./Layout/Auth";
import DashBoardLayout from "./Layout/DashBoardLayout";
import logo from "./assets/logo.png";
import sideBarLogo from "./assets/sideBarLogo.png";
import { Toaster } from "react-hot-toast";
import SignIn from "./pages/Auth/SignIn";
import ForgotPassword from "./pages/Auth/Forgot-password";
import ResetPassword from "./pages/Auth/ResetPassword";
import ProjectManagement from "./components/vendor/ProjectManagement";
import CreateProjectForm from "./components/vendor/CreateProjectForm";
import ViewRequisition from "./components/vendor/ViewRequisition";
import Contracts from "./components/vendor/Contracts";
import ProductManagement from "./components/vendor/ProductManagement";
import CreateProductForm from "./components/vendor/CreateProductForm";
import AddRequisition from "./components/Requisition/AddRequisition";
import Dashboard from "./components/Dashboard";
import VendorContact from "./pages/vendorContract/VendorContract";
import HomePage from "./components/LandingPages/HomePage";
import RequisitionsManagement from "./components/vendor/RequisitionsManagement";
import VendorManagement from "./components/vendor/VendorManagement";
import VendorFormContainer from "./components/VendorForm/VendorFormContainer";
import PoManagement from "./components/po/PoManagement";
import UserInfo from "./components/settings/UserInfo";
import CreateUserForm from "./components/user/AddUser";
import UserManagement from "./components/user/UserManagement";
import Test from "./components/vendor/ProjectManagementTest";
import ChatLayout from "./Layout/ChatLayout";
import Chat from "./components/chat/Chat";
import PoSummary from "./components/po/PoSummary";
import Roles from "./components/roles/Roles";
import GroupSummary from "./pages/GroupSummary";
import NegotiationChat from "./components/NegotiationChat";
import DealsPage from "./pages/chatbot/DealsPage";
import NegotiationRoom from "./pages/chatbot/NegotiationRoom";
import NewDealPageWrapper from "./pages/chatbot/NewDealPageWrapper";
import ConversationRoom from "./pages/chatbot/ConversationRoom";
import SummaryPage from "./pages/chatbot/SummaryPage";
import NegotiationSummary from "./pages/chatbot/NegotiationSummary";
import DemoScenarios from "./pages/chatbot/DemoScenarios";
import AboutPage from "./pages/chatbot/AboutPage";
// ConversationDealPage import removed - old route deprecated
import RequisitionListPage from "./pages/chatbot/RequisitionListPage";
import RequisitionDealsPage from "./pages/chatbot/RequisitionDealsPage";
import ArchivedRequisitionsPage from "./pages/chatbot/ArchivedRequisitionsPage";
import ArchivedDealsForRequisitionPage from "./pages/chatbot/ArchivedDealsForRequisitionPage";
import Feedback from "./pages/Feedback";
import { BidAnalysisListPage, BidAnalysisDetailPage } from "./pages/BidAnalysis";

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
            path="/sign-in"
            element={
              <Layout logo={logo}>
                <SignIn />
              </Layout>
            }
          />
          <Route
            path="/sign-up"
            element={
              <Layout logo={logo}>
                <SignUp />
              </Layout>
            }
          />

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
          <Route path="test" element={<DashBoardLayout logo={sideBarLogo} />}>
            <Route index element={<Test />} />
          </Route>
          <Route path="test-negotiation" element={<DashBoardLayout logo={sideBarLogo} />}>
            <Route index element={<NegotiationChat />} />
          </Route>

          <Route path="/successmessage" element={<SuccessMessage />} />

          <Route
            path="/project-management"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >


            {/* <Route
            path="/project-management"
            element={
              <ProtectedRoute
                element={<DashBoardLayout logo={sideBarLogo} />}
                permission="project:R"
              />
            }
          > */}
            <Route index element={<ProjectManagement />} />
            <Route path="create-project" element={<CreateProjectForm />} />
            <Route path="editprojectform/:id" element={<CreateProjectForm />} />
            {/* <Route path="requisition/contract" element={<Contracts />} /> */}
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
            {/* <Route path="create-project" element={<CreateProjectForm />} /> */}
            {/* <Route path="editproductform/:id" element={<CreateProjectForm />} /> */}
            {/* <Route path="requisition" element={<ViewRequisition />} /> */}
            <Route path="create-vendor/" element={<VendorFormContainer />} />
            <Route path="edit-vendor/:id" element={<VendorFormContainer />} />
            <Route path="add-vendor/:id" element={<VendorFormContainer />} />
            {/* <Route path="edit-requisition/:id" element={<AddRequisition />} /> */}
            {/* <Route path="requisition/contract" element={<Contracts />} /> */}
          </Route>

          <Route
            path="/po-management"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<PoManagement />} />
            <Route path="summary" element={<PoSummary />} />
            {/* <Route path="create-vendor/" element={<AddVendor />} />
            <Route path="edit-vendor/:id" element={<AddVendor />} />
            <Route path="add-vendor/:id" element={<AddVendor />} /> */}
          </Route>
          <Route
            path="/user-management"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            <Route index element={<UserManagement />} />
            {/* <Route path="create-project" element={<CreateProjectForm />} /> */}
            {/* <Route path="editproductform/:id" element={<CreateProjectForm />} /> */}
            {/* <Route path="requisition" element={<ViewRequisition />} /> */}
            <Route path="create-user/" element={<CreateUserForm />} />
            <Route path="edit-user/:id" element={<CreateUserForm />} />
            <Route path="edit-roles/" element={<Roles />} />
            {/* <Route path="edit-requisition/:id" element={<AddRequisition />} /> */}
            {/* <Route path="requisition/contract" element={<Contracts />} /> */}
          </Route>
          <Route path="/chat" element={<ChatLayout logo={sideBarLogo} />}>
            <Route index element={<Chat />} />
            <Route path="create-user/" element={<CreateUserForm />} />
            <Route path="edit-user/:id" element={<CreateUserForm />} />
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
            {/* <Route path="create-project" element={<CreateProjectForm />} /> */}
            {/* <Route path="editproductform/:id" element={<CreateProjectForm />} /> */}
            {/* <Route path="requisition" element={<ViewRequisition />} /> */}
            <Route path="create-user/" element={<CreateUserForm />} />
            <Route path="edit-user/:id" element={<CreateUserForm />} />
            {/* <Route path="edit-requisition/:id" element={<AddRequisition />} /> */}
            {/* <Route path="requisition/contract" element={<Contracts />} /> */}
          </Route>
          <Route
            path="/group-summary"
            element={<DashBoardLayout logo={sideBarLogo} />}
          ></Route>

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
            <Route path="requisitions/:requisitionId" element={<BidAnalysisDetailPage />} />
          </Route>

          {/* Chatbot Routes */}
          <Route
            path="/chatbot"
            element={<DashBoardLayout logo={sideBarLogo} />}
          >
            {/* Main page: Requisition list at /chatbot/requisitions */}
            <Route path="requisitions" element={<RequisitionListPage />} />
            {/* Requisition deals page (Level 2) */}
            <Route path="requisitions/:requisitionId" element={<RequisitionDealsPage />} />
            {/* Archived requisitions and deals */}
            <Route path="requisitions/archived" element={<ArchivedRequisitionsPage />} />
            <Route path="requisitions/:requisitionId/archived" element={<ArchivedDealsForRequisitionPage />} />
            {/* Legacy flat deals list (accessible via /chatbot/all-deals) */}
            <Route path="all-deals" element={<DealsPage />} />
            {/* Deal management - create new deal (with optional requisitionId query param) */}
            <Route path="requisitions/deals/new" element={<NewDealPageWrapper />} />
            {/* Nested URL structure for deals (hierarchical pattern) */}
            <Route path="requisitions/:rfqId/vendors/:vendorId/deals/:dealId" element={<NegotiationRoom />} />
            <Route path="requisitions/:rfqId/vendors/:vendorId/deals/:dealId/conversation" element={<ConversationRoom />} />
            <Route path="requisitions/:rfqId/vendors/:vendorId/deals/:dealId/summary" element={<SummaryPage />} />
            <Route path="summary" element={<NegotiationSummary />} />
            <Route path="demo" element={<DemoScenarios />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
