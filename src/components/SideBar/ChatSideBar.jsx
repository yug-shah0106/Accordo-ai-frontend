import { Card, CardContent } from "@mui/material";
import sideBarLogo from "../../assets/sideBarLogo.png";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Calendar, Package, FileText, ChevronRight } from "lucide-react";
import { authApi } from "../../api";

export default function ChatSidebar() {
    const { state } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [projectDataa, setProjectDataa] = useState();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const projectData = {
        projectId: "P12345",
        requisitionId: state?.Requisition?.rfqId || "N/A",
        name: "John Doe",
        deliveryDate: state?.Requisition?.deliveryDate?.split("T")[0] || "N/A",
        negotiationDate: state?.Requisition?.negotiationClosureDate?.split("T")[0] || "N/A",
        products: state?.Requisition?.RequisitionProduct || [],
    };

    useEffect(() => {
        getProductDeatils();
    }, []);

    const getProductDeatils = async () => {
        try {
            const res = await authApi.get(`/project/get/${state?.Requisition?.projectId}`);
            setProjectDataa(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="relative">
            {/* Toggle Button for Mobile */}
            <button
                onClick={toggleSidebar}
                className="sm:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <div
                className={`bg-white p-6 border-r min-h-screen w-80 fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out shadow-lg
                ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 sm:relative sm:w-80`}
            >
                {/* Logo */}
                <div className="flex items-center justify-center px-4 py-6 border-b border-gray-100">
                    <img src={sideBarLogo} alt="Logo" className="w-24 h-auto" />
                </div>

                {/* Project and Requisition Info */}
                <div className="w-full p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 mt-6">
                    <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <p className="font-semibold text-blue-700">Project Details</p>
                    </div>
                    <div className="space-y-2">
                        {/* <p className="text-sm text-gray-600">Project ID: <span className="font-medium text-gray-900">{projectDataa?.projectId}</span></p> */}
                        <p className="text-sm text-gray-600">Requisition ID: <span className="font-medium text-gray-900">{projectData?.requisitionId}</span></p>
                    </div>
                </div>

                {/* Project Details */}
                <Card className="mt-6 shadow-sm rounded-xl bg-white border border-gray-100">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-600" />
                                <p className="font-semibold text-gray-800">Project Information</p>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Name:</span>
                                    <span className="text-sm font-medium text-gray-900">{projectDataa?.projectName}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">Delivery Date:</span>
                                    <span className="text-sm font-medium text-gray-900">{projectData.deliveryDate}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">Negotiation Date:</span>
                                    <span className="text-sm font-medium text-gray-900">{projectData.negotiationDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Package className="w-5 h-5 text-blue-600" />
                                <p className="font-semibold text-gray-800">Product Details</p>
                            </div>
                            
                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-blue-50">
                                            <th className="px-4 py-3 text-left font-semibold text-blue-700">Product Name</th>
                                            <th className="px-4 py-3 text-center font-semibold text-blue-700">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {projectData?.products?.length > 0 ? (
                                            projectData?.products?.map((product, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-blue-50/50 transition-colors duration-200"
                                                >
                                                    <td className="px-4 py-3 text-gray-700">{product?.Product?.productName || "N/A"}</td>
                                                    <td className="px-4 py-3 text-center text-gray-700">{product?.qty || 0}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="px-4 py-3 text-center text-gray-500">
                                                    No products available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Overlay for Mobile when Sidebar is Open */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden backdrop-blur-sm"
                ></div>
            )}
        </div>
    );
}
