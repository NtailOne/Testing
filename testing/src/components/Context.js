import React, { useState } from 'react';
const packageJson = require('../../package.json');

const initialState = {
    adminLogged: false,
    setAdminLogged: () => {},
    userLogged: false,
    setUserLogged: () => {},
    serverURL: packageJson.proxy
};
export const Context = React.createContext(initialState);

export const ContextProvider = ({ children }) => {
    const [state, setState] = useState(initialState);

    const setAdminLogged = (newVal) => {
        setState(prev => ({ ...prev, adminLogged: newVal }));
    }
    
    const setUserLogged = (newVal) => {
        setState(prev => ({ ...prev, userLogged: newVal }));
    }

    return (
        <Context.Provider value={{...state, setAdminLogged, setUserLogged}}>
            {children}
        </Context.Provider>
    );
}