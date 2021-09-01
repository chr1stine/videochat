import React, { useContext, useEffect } from 'react';
import chatContext from '../chatContext';
import Identification from './Identification';
import Main from './Main'

const App = ()=>{

    const { user, login, logout } = useContext(chatContext);

    // восстановление "незавершенной" сессии
    useEffect(async ()=>{
        if (!user){
            const savedUserId = sessionStorage.getItem("current");
            if (savedUserId){
                login(savedUserId);
            }
        }
    },[]);

    // при отключении через закрытие вкладки и т.д.
    window.onbeforeunload = async ()=>{
        const accidentally = true;
        await logout(accidentally); 
    }

    return(
        <div className="wrapper">
            { user === null ? <Identification /> : <Main /> }
        </div>
    );
}

export default App;