import {Route} from "react-router-dom";
import React from "react";
import {matchPath} from "react-router";
import LoginPage from "./components/authPages/LoginPage";
import RegistrationPage from "./components/authPages/RegistrationPage";
import ForgotPasswordPage from "./components/authPages/ForgotPasswordPage";
import ResetPasswordPage from "./components/authPages/ResetPasswordPage";

export const unAuthorizedRoutes = [
    {path: '/login/:activation_token?', component: LoginPage},
    {path: '/registration', component: RegistrationPage},
    {path: '/forgot_password', component: ForgotPasswordPage},
    {path: '/reset_password/:password_reset_token', component: ResetPasswordPage},
]
export const matchesAnyUnauthorizedRoute = (path) => {
    return unAuthorizedRoutes.some(r => matchPath(path, r.path));
};

const UnauthorizedRoutes = () => <>
    {unAuthorizedRoutes.map(r => <Route path={r.path} component={r.component}/>)}
</>

export default UnauthorizedRoutes;