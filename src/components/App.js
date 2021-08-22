import React, { useContext, useEffect, useRef, useState } from 'react';
import chatContext from '../chatContext';
import Identification from './Identification';
import Main from './Main'

const App = ()=>{

    // восстановление из незавершенной сессии
    useEffect(()=>{
        const restoringSession = async ()=>{
            if (!user){
                const savedUserId = sessionStorage.getItem("currentUserId");
                if (savedUserId){
                    await login(savedUserId);
                    setLoginRequest(false);
                }
            }
        }
        
        restoringSession();
    },[]);

    const { 
        user, setUser,
        localStreamRef, remoteStreamRef,
        callStatus, setCallStatus,
        connection,
        call,setCall,
        caller, setCaller,
        callee, setCallee,
        firestore, stopCall,
        usersIds,setUsersIds,
        loginRequest,setLoginRequest,
        login
    } = useContext(chatContext);

    // при отключении через закрытие вкладки и т.д.
    window.onbeforeunload = async ()=>{
        if (call){
            stopCall();
        }
        
        if (user){
            // disconnectHandler
            firestore.collection('usersIds').doc(user.id).delete();
            setUser(null);
        }
    }

    return(
        <div className="wrapper">

            { loginRequest && <Identification />}

            <Main />

        </div>
    );
}

export default App;