import { lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import MainLayout from "@components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleBasedRoute from "@/components/auth/RoleBasedRoute";
import DetailAssetPage from "@/pages/Assets/detail-asset";
import ResidentsPage from "@/pages/Residents/view-residents";
import DetailResidentPage from "@/pages/Residents/detail-resident";
import BlocksPage from "@/pages/Blocks/view-blocks";
import CreateBlockPage from "@/pages/Blocks/create-block";
import UpdateBlockPage from "@/pages/Blocks/update-block";
// import DetailNotificationPage from "@/pages/Notifications/detail-notification";
import DetailBlockPage from "@/pages/Blocks/detail-block";
import DetailApartmentPage from "@/pages/Apartments/detail-apartment";
import ApartmentsPage from "@/pages/Apartments/view-apartments";
// import CreateVotingPage from "@/pages/Votings/create-voting";
// import UpdateVotingPage from "@/pages/Votings/update-voting";
// import DetailVotingPage from "@/pages/Votings/detail-voting";
// import InvoicesPage from "@/pages/Invoices/view-invoices";
// import DetailInvoicePage from "@/pages/Invoices/detail-invoice";
// import TechniciansPage from "@/pages/Technicians/view-technicians";
// import DetailTechnicianPage from "@/pages/Technicians/detail-technician";
// import MaintenancesPage from "@/pages/Maintenances/view-maintenances";
// import DetailMaintenancePage from "@/pages/Maintenances/detail-maintenance";
// import IssuesPage from "@/pages/Issues/view-issues";
// import DetailIssuePage from "@/pages/Issues/detail-issue";
// import FeesPage from "@/pages/Fees/view-fees";
// import DetailFeePage from "@/pages/Fees/detail-fee";
import AccountsPage from "@/pages/Accounts/view-accounts";
import DetailAccountPage from "@/pages/Accounts/detail-account";

const Assets = lazy(() => import("@/pages/Assets/view-assets"));
// const Notifications = lazy(
// 	() => import("@/pages/Notifications/view-notifications"),
// );
// const SystemNotifications = lazy(() => import("@/pages/SystemNotifications"));
// const Services = lazy(() => import("@/pages/Services"));
// const Report = lazy(() => import("@/pages/Report"));
// const DetailServicePage = lazy(() => import("@/pages/Services/DetailService"));
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
// const VotingsPage = lazy(() => import("@/pages/Votings/view-votings"));
const ProfilePage = lazy(() => import("@/pages/Profile"));
const UnauthorizedPage = lazy(() => import("@/pages/Unauthorized"));

export const routes = createBrowserRouter([
	{ path: "/login", element: <Login /> },
	{ path: "/forgot-password", element: <ForgotPassword /> },
	{ path: "/verify-email", element: <VerifyEmail /> },
	{ path: "/reset-password", element: <ResetPassword /> },
	{ path: "/unauthorized", element: <UnauthorizedPage /> },
	{
		path: "/",
		element: (
			<ProtectedRoute>
				<MainLayout />
			</ProtectedRoute>
		),
		children: [
			{ index: true, element: <Navigate to="/blocks" replace /> },

			// Assets - ADMIN only
			{
				path: "assets",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<Assets />
					</RoleBasedRoute>
				),
			},
			{
				path: "assets/:id",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<DetailAssetPage />
					</RoleBasedRoute>
				),
			},

			// // Notifications - ADMIN & TECHNICIAN
			// {
			// 	path: "notifications",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN", "TECHNICIAN"]}>
			// 			<Notifications />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "notifications/:id",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN", "TECHNICIAN"]}>
			// 			<DetailNotificationPage />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// // System Notifications - ADMIN & TECHNICIAN
			// {
			// 	path: "system-notifications",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN", "TECHNICIAN"]}>
			// 			<SystemNotifications />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// // Residents - ADMIN only
			{
				path: "residents",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<ResidentsPage />
					</RoleBasedRoute>
				),
			},
			{
				path: "residents/:id",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<DetailResidentPage />
					</RoleBasedRoute>
				),
			},

			// // Services - ADMIN only
			// {
			// 	path: "services",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<Services />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "services/:id",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<DetailServicePage />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// // Reports - ADMIN only
			// {
			// 	path: "reports",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<Report />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// // Blocks - ADMIN only
			{
				path: "blocks",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<BlocksPage />
					</RoleBasedRoute>
				),
			},
			{
				path: "blocks/:id",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<DetailBlockPage />
					</RoleBasedRoute>
				),
			},
			{
				path: "blocks/create",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<CreateBlockPage />
					</RoleBasedRoute>
				),
			},
			{
				path: "blocks/update/:id",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<UpdateBlockPage />
					</RoleBasedRoute>
				),
			},

			// // Apartments - ADMIN only
			{
				path: "apartments",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<ApartmentsPage />
					</RoleBasedRoute>
				),
			},
			{
				path: "apartments/:id",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<DetailApartmentPage />
					</RoleBasedRoute>
				),
			},

			// // Votings - ADMIN only
			// {
			// 	path: "votings",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<VotingsPage />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "votings/create",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<CreateVotingPage />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "votings/update/:id",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<UpdateVotingPage />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "votings/:id",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<DetailVotingPage />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// // Invoices - ADMIN only
			// {
			// 	path: "invoices",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<InvoicesPage />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "invoices/:id",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<DetailInvoicePage />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// // Fees - ADMIN only
			// {
			// 	path: "fees",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<FeesPage />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "fees/:id",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<DetailFeePage />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// // Technicians - ADMIN only
			// {
			// 	path: "technicians",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<TechniciansPage />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "technicians/:id",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN"]}>
			// 			<DetailTechnicianPage />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// // Issues/Requests - ADMIN & TECHNICIAN
			// {
			// 	path: "issues",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN", "TECHNICIAN"]}>
			// 			<IssuesPage />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "issues/:id",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN", "TECHNICIAN"]}>
			// 			<DetailIssuePage />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// // Maintenances - ADMIN & TECHNICIAN
			// {
			// 	path: "maintenances",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN", "TECHNICIAN"]}>
			// 			<MaintenancesPage />
			// 		</RoleBasedRoute>
			// 	),
			// },
			// {
			// 	path: "maintenances/:id",
			// 	element: (
			// 		<RoleBasedRoute allowedRoles={["ADMIN", "TECHNICIAN"]}>
			// 			<DetailMaintenancePage />
			// 		</RoleBasedRoute>
			// 	),
			// },

			// Profile - all authenticated users
			{ path: "profile", element: <ProfilePage /> },

			// Accounts - ADMIN only
			{
				path: "accounts",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<AccountsPage />
					</RoleBasedRoute>
				),
			},
			{
				path: "accounts/:accountId",
				element: (
					<RoleBasedRoute allowedRoles={["ADMIN"]}>
						<DetailAccountPage />
					</RoleBasedRoute>
				),
			},
		],
	},
]);
