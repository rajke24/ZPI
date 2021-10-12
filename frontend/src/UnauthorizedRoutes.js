import {Route} from "react-router-dom";
import React from "react";
import {matchPath} from "react-router";
import LoginPage from "./components/login/LoginPage";

export const unAuthorizedRoutes = [
    {path: '/login', component: LoginPage},
    // {path: '/logout', component: Logout},
    // {path: '/registration', component: Registration}
]
export const matchesAnyUnauthorizedRoute = (path) => {
    return unAuthorizedRoutes.some(r => matchPath(path, r.path));
};

const UnauthorizedRoutes = () => <>
    {unAuthorizedRoutes.map(r => <Route path={r.path} component={r.component}/>)}
</>

export default UnauthorizedRoutes;