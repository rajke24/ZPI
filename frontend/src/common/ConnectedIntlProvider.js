import {IntlProvider} from 'react-intl';
import React from "react";
import en from '../translations/en';
import pl from '../translations/pl';
import {useSelector} from "react-redux";

const messages = {
    en, pl
};

const ConnectedIntlProvider = ({children}) => {
    const locale = useSelector(state => state.persistentState.locale);

    const onError = e => {
        console.warn(e)
    }

    return <IntlProvider
        locale={locale}
        messages={messages[locale]}
        onError={onError}
    >
        {children}
    </IntlProvider>
}

export default ConnectedIntlProvider;
