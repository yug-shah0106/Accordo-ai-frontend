import { Navigate } from "react-router-dom";
import { tokenStorage } from "../../utils/tokenStorage";

const ProtectedRoute = ({ element, permission }) => {
    // Check if user has tokens (is authenticated)
    if (!tokenStorage.hasTokens()) {
        return <Navigate to="/sign-in" replace />;
    }

    // const hasPermission = (perm) => {
    //     const userPermissions =
    //         JSON.parse(localStorage.getItem("projectPermission")) || [];
    //     console.log("User Permissions:", userPermissions);

    //     const [module, permissionType] = perm.split(":");

    //     return userPermissions.includes(permissionType);
    // };

    // return hasPermission(permission) ? element : "  ";
    return element
};

export default ProtectedRoute;

