import React, { useContext, useEffect, useRef, useState } from 'react';
import Videos from './Videos'
import * as _ from 'lodash'
import IncomingCall from './IncomingCall';
import chatContext from '../chatContext';
import UsersList from './UsersList';
import Connect from './Connect';

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
   

    // исходящий звонок
    async function callHandler(){
        setCallStatus('outgoing');

        const caller1 = firestore.collection('usersIds').doc(user.id);
        const callee1 = firestore.collection('usersIds').doc(inputRef.current.value);

        if (!usersIds.includes(callee1.id)){
            setCallStatus('callee with given id not found');
        }else if(callee1 && caller1 != callee1){

            // соединение
            connection.current = await new RTCPeerConnection(servers);
            
            // обмен потоками
            localStreamRef.current.getTracks().forEach(track=>{
                connection.current.addTrack(track,localStreamRef.current);
            });
            connection.current.ontrack = event =>{
                event.streams[0].getTracks().forEach(track=>{
                    remoteStreamRef.current.addTrack(track);
                });
            }

            // создание нового документа звонка
            const call1 = firestore.collection('calls').doc();
            call1.set({});
            await caller1.set({
                outgoingCallID: call1.id
            });
            await callee1.set({
                incomingCallID: call1.id,
                callerID: caller1.id
            });
            await call1.update({
                calleeID: callee1.id,
                callerID: caller1.id
            });



            // подписка на появление новой ICE-конфигурации на своей стороне
            const offerCandidates = await call1.collection('offerCandidates');
            connection.current.onicecandidate = event => {
                event.candidate && offerCandidates.add(event.candidate.toJSON());
            };

            // подписка на появление новой ICE-конфигурации на стороне собеседника
            const answerCandidates = await call1.collection('answerCandidates');
            answerCandidates.onSnapshot(snapshot => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        let data = change.doc.data();
                        connection.current.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });




            // отправление оффера
            const offerDesc = await connection.current.createOffer();
            await connection.current.setLocalDescription(offerDesc);
            const offer = {
                sdp: offerDesc.sdp,
                type: offerDesc.type,
            };
            await call1.update({ offer });



            // подписка на события звонка
            call1.onSnapshot(async snapshot => {
                if (snapshot.exists){
                    const data = snapshot.data();                
                    if (!connection.current.currentRemoteDescription && data?.answer) {
                        const answerDescription = new RTCSessionDescription(data.answer);
                        connection.current.setRemoteDescription(answerDescription);
                    }

                    if (data.status === 'hanged up'){
                        stopCall();
                        setCallStatus(data.status);
                    }
    
                    if (data.status === 'accepted'){
                        setCallStatus(data.status);
                    }
    
                    if (data.status === 'declined'){
                        stopCall();
                        setCallStatus(data.status);
                    }

                    if (data.status === 'canceled'){
                        stopCall();
                        setCallStatus(data.status);
                    }
                }
            });

            
            setCallee(callee1);
            setCaller(caller1);
            setCall(call1);

        }else if (caller1 != callee1){
            setCallStatus('you can\'t call yourself');
        }else{
            setCallStatus('callee with given id not found');
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
                        <button className='btn btn-primary' onClick={callHandler} disabled={!(user && !call)}>Позвонить</button>
                        <button className='btn btn-primary' onClick={hangUpHandler} disabled={!(call && callStatus === 'accepted' || callStatus === 'outgoing')}>Сбросить</button>
                        <button className='btn btn-primary' onClick={disconnectHandler} disabled={!user}>Отключиться</button>
                        <input className='form-control input' ref={inputRef} type="text" placeholder="ID абонента"></input>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;