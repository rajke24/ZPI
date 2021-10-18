import {Route} from "react-router-dom";
import React from "react";
import {matchPath} from "react-router";
import LoginPage from "./components/authPages/LoginPage";
// import Logout from "./components/authPages/Logout";
import RegistrationPage from "./components/authPages/RegistrationPage";
import ForgotPasswordPage from "./components/authPages/ForgotPasswordPage";

export const unAuthorizedRoutes = [
    {path: '/login/:activation_token?', component: LoginPage},
    // {path: '/logout', component: Logout},
    {path: '/registration', component: RegistrationPage},
    {path: '/forgot_password', component: ForgotPasswordPage},
]
export const matchesAnyUnauthorizedRoute = (path) => {
    return unAuthorizedRoutes.some(r => matchPath(path, r.path));
};

const UnauthorizedRoutes = () => <>
    {unAuthorizedRoutes.map(r => <Route path={r.path} component={r.component}/>)}
</>

export default UnauthorizedRoutes;