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
});

export const buildMessages = (messages = {}) => {
    return {...messages, ...commonMessages};
};
