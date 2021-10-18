import {defineMessages} from "react-intl";

export const commonMessages = defineMessages({
    navbarLogout: {
        id: "Navbar.Logout",
        defaultMessage: "Logout"
    },
    navbarProfile: {
        id: "Navbar.Profile",
        defaultMessage: "Profile"
    },
    appName: {
        id: "Common.AppName.Header",
        defaultMessage: 'ByeSpy'
    },
});

export const buildMessages = (messages = {}) => {
    return {...messages, ...commonMessages};
};
