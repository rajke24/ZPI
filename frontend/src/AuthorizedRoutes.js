import {Route} from "react-router-dom";
import {matchPath} from "react-router";

export const authorizedRoutes = [
    // {path: '/contacts', component: Contacts},
    // {path: '/profile', component: Profile},
]

export const matchesAnyAuthorizedRoute = (path) => {
    return authorizedRoutes.some(r => matchPath(path, r.path));
}

export const defaultRoute = () => {
    return '/contacts'
};

const AuthorizedRoutes = () => {
    return <>
        {authorizedRoutes.filter(r => r.component).map((r,idx) => <Route exact key={idx} path={r.path} component={r.component}/>)}
    </>
}

export default AuthorizedRoutes;