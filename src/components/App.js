import React, { useContext, useEffect, useRef, useState } from 'react';
import chatContext from '../chatContext';
import Identification from './Identification';
import Main from './Main'

const App = ()=>{

    const { user, login, disconnect, clean } = useContext(chatContext);

    // восстановление из незавершенной сессии
    useEffect(()=>{
        const restoringSession = async ()=>{
            if (!user){
                const savedUserId = sessionStorage.getItem("currentUserId");
                if (savedUserId){
                    await login(savedUserId);
                }
            }
        }
        
        restoringSession();
    },[user]);

    // при отключении через закрытие вкладки и т.д.
    window.onbeforeunload = async ()=>{
        await disconnect();
        await clean();
    }

    const content = user === null ? <Identification /> : <Main />

    return(
        <div className="wrapper">
            { content }
        </div>
    );
}

export default App;