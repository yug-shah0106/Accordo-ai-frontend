import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import VerifyOtp from "./components/vendor/VerifyOtp";
import AuthPage from "./pages/auth/AuthPage";
import { OnboardingPage } from "./pages/onboarding";
import VendorChat from "./pages/vendorChat/VendorChat";
import Layout from "./layout/Auth";
import DashBoardLayout from "./layout/DashBoardLayout";
import logo from "./assets/logo.png";
import sideBarLogo from "./assets/sideBarLogo.png";
import { Toaster } from "react-hot-toast";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import HomePage from "./components/landingPages/HomePage";
import VendorContact from "./pages/vendorContract/VendorContract";

// Lazy-loaded authenticated routes — each becomes its own JS chunk fetched on
// first navigation rather than included in the initial bundle.
const ProjectManagement = lazy(
  () => import("./components/vendor/ProjectManagement"),
);
const CreateProjectForm = lazy(
  () => import("./components/vendor/CreateProjectForm"),
);
const ViewRequisition = lazy(
  () => import("./components/vendor/ViewRequisition"),
);
const Contracts = lazy(() => import("./components/vendor/Contracts"));
const ProductManagement = lazy(
  () => import("./components/vendor/ProductManagement"),
);
const CreateProductForm = lazy(
  () => import("./components/vendor/CreateProductForm"),
);
const AddRequisition = lazy(
  () => import("./components/requisition/AddRequisition"),
);
const Dashboard = lazy(() => import("./components/Dashboard"));
const RequisitionsManagement = lazy(
  () => import("./components/vendor/RequisitionsManagement"),
);
const VendorManagement = lazy(
  () => import("./components/vendor/VendorManagement"),
);
const VendorFormContainer = lazy(
  () => import("./components/vendorForm/VendorFormContainer"),
);
const UserInfo = lazy(() => import("./components/settings/UserInfo"));
const CreateUserForm = lazy(() => import("./components/user/AddUser"));
const UserManagement = lazy(() => import("./components/user/UserManagement"));
const Roles = lazy(() => import("./components/roles/Roles"));
const GroupSummary = lazy(() => import("./pages/GroupSummary"));
const NegotiationRoom = lazy(() => import("./pages/chatbot/NegotiationRoom"));
const NewDealPageWrapper = lazy(
  () => import("./pages/chatbot/NewDealPageWrapper"),
);
const ConversationRoom = lazy(() => import("./pages/chatbot/ConversationRoom"));
const SummaryPage = lazy(() => import("./pages/chatbot/SummaryPage"));
const RequisitionListPage = lazy(
  () => import("./pages/chatbot/RequisitionListPage"),
);
const RequisitionDealsPage = lazy(
  () => import("./pages/chatbot/RequisitionDealsPage"),
);
const ArchivedRequisitionsPage = lazy(
  () => import("./pages/chatbot/ArchivedRequisitionsPage"),
);
const ArchivedDealsForRequisitionPage = lazy(
  () => import("./pages/chatbot/ArchivedDealsForRequisitionPage"),
);
const Feedback = lazy(() => import("./pages/Feedback"));
const BidAnalysisListPage = lazy(() =>
  import("./pages/bidAnalysis").then((m) => ({
    default: m.BidAnalysisListPage,
  })),
);
const BidAnalysisDetailPage = lazy(() =>
  import("./pages/bidAnalysis").then((m) => ({
    default: m.BidAnalysisDetailPage,
  })),
);

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
    Loading…
  </div>
);

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
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
              <Route
                path="editproductform/:id"
                element={<CreateProductForm />}
              />
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
              <Route
                path="editprojectform/:id"
                element={<CreateProjectForm />}
              />
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
              <Route
                path="editproductform/:id"
                element={<CreateProjectForm />}
              />
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
              <Route path="requisitions" element={<RequisitionListPage />} />
              <Route
                path="requisitions/:requisitionId"
                element={<RequisitionDealsPage />}
              />
              <Route
                path="requisitions/archived"
                element={<ArchivedRequisitionsPage />}
              />
              <Route
                path="requisitions/:requisitionId/archived"
                element={<ArchivedDealsForRequisitionPage />}
              />
              <Route
                path="requisitions/deals/new"
                element={<NewDealPageWrapper />}
              />
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
        </Suspense>
      </BrowserRouter>
    </>
  );
}
export default App;
