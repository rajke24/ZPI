import {Route} from "react-router-dom";
import {matchPath} from "react-router";
import Chat from "./components/mainPage/chat/Chat";
import Invitations from "./components/invitations/Invitations";
import Settings from "./components/settings/Settings";

export const authorizedRoutes = [
    {path: '/settings', component: Settings},
    {path: '/chat/:name?', component: Chat},
    {path: '/invitations', component: Invitations},
]

export const matchesAnyAuthorizedRoute = (path) => {
    return authorizedRoutes.some(r => matchPath(path, r.path));
}

export const defaultRoute = () => {
    return '/chat'
};

const AuthorizedRoutes = () => {
    return <>
        {authorizedRoutes.filter(r => r.component).map((r,idx) => <Route exact key={idx} path={r.path} component={r.component}/>)}
    </>
}

export default AuthorizedRoutes;