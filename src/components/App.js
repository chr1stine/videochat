import React, { useContext, useEffect, useRef, useState } from 'react';
import Videos from './Videos'
import * as _ from 'lodash'
import IncomingCall from './IncomingCall';
import chatContext from '../chatContext';
import UsersList from './UsersList';
import Connect from './Connect';
import Call from './Call';
import HangUp from './HangUp';
import Disconnect from './Disconnect';
import Input from './Input';

const App = ()=>{

    const { 
        user, setUser,
        localStreamRef, remoteStreamRef,
        callStatus, setCallStatus,
        connection,
        call,setCall,
        caller, setCaller,
        callee, setCallee,
        firestore, stopCall,
        usersIds,setUsersIds
    } = useContext(chatContext);

    const servers = {
        iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
        ],
        iceCandidatePoolSize: 10,
    };

    const inputRef = useRef(null);

    // при отключении через закрытие вкладки и т.д.
    window.onbeforeunload = async ()=>{
        if (call){
            stopCall();
        }
        
        if (user){
            firestore.collection('usersIds').doc(user.id).delete();
            setUser(null);
        }
    }
   
    // отключение
    async function disconnectHandler(){

        if (call){
            hangUpHandler();
        }

        localStreamRef.current.getTracks().forEach(function(track) {
            track.stop();
        });

        firestore.collection('users').doc(user.id).delete();
        setUser(null);

        setUsersIds([]);
    }

    // обработка события сброса звонка
    async function hangUpHandler(){
        let status = callStatus === 'outgoing' ? 'canceled' : 'hanged up'
        await call.update({
            status
        });
    }

    return(
        <div className="wrapper">
            <div className="container">

                {usersIds && user && <UsersList />}
                {callStatus === 'incoming' && call && <IncomingCall firestore={firestore}/>}
                {user && <Videos localStream={localStreamRef.current} remoteStream={remoteStreamRef.current}/>}

                <div className="buttons-wrapper">
                    <div className="buttons-container">
                        <Connect />
                        <Call inputRef={inputRef} />
                        <HangUp hangUpHandler={hangUpHandler}/>
                        <Disconnect disconnectHandler={disconnectHandler}/>
                        <Input inputRef={inputRef}/>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default App;