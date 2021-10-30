import axios from "axios";
import {buildMessages} from "../common/commonMessages";

const messages = buildMessages();

export const get = (url, params, callback) => {
    const config = {
        url: url,
        params
    };
    axios.request(config).then(
        result => callback && callback(result.data)
    );
};

export const post = (url, data, callback) => {
    const config = {
        url,
        method: 'POST',
        data
    };
    axios.request(config).then(result => callback && callback(result.data));
};

export const save = (url, method, data, callback) => {
    const config = {
        url,
        method,
        data: {
            ...data
        },
        message: messages.saved
    };
    axios.request(config).then(result =>
        callback && callback(result.data)
    );
}

const remove = (url, callback) => {
    let config = {
        url,
        method: "DELETE",
        message: messages.deleted
    };
    axios.request(config).then(callback);
};


export const buildApiClient = (resourceName, url) => {
    const apiUrl = url || `${resourceName}s`;
    const findAll = (callback, params) => {
        get(`/${apiUrl}`, params, callback);
    };

    const findOne = (id, callback) => {
        get(`/${apiUrl}/${id}`, undefined, callback);
    };

    const saveResource = (resource, callback) => {
        const url = resource.id ? `/${apiUrl}/${resource.id}` : `/${apiUrl}`;
        const method = resource.id ? "PUT" : "POST";
        save(url, method, {[resourceName]: resource}, callback);
    };

    const removeResource = (id, callback) => {
        remove(`/${apiUrl}/${id}`, callback);
    };

    return {findAll, findOne, save: saveResource, remove: removeResource};
};
