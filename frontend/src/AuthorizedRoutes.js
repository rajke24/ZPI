import {Route} from "react-router-dom";
import {matchPath} from "react-router";

export const authorizedRoutes = [
    // {path: '/path, component: Component, roles: [...roles},
]

export const matchesAnyAuthorizedRoute = (profile, path) => {
    return authorizedRoutes.some(r => matchPath(path, r.path));
}

export const defaultRoute = () => {
    // return default route
};

const AuthorizedRoutes = () => {
    return <>
        {authorizedRoutes.filter(r => r.component).map((r,idx) => <Route exact key={idx} path={r.path} component={r.component}/>)}
    </>
}

export default AuthorizedRoutes;