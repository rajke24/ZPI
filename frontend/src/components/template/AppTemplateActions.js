import axios from "axios";

export const LOGOUT = 'LOGOUT';

export const logout = () => {
    return {
        type: LOGOUT
    };
};