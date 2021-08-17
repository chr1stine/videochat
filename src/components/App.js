import React, { useContext, useEffect, useRef, useState } from 'react';
import Videos from './Videos'
import * as _ from 'lodash'
import IncomingCall from './IncomingCall';
import chatContext from '../chatContext';
import UsersList from './UsersList';

const App = ()=>{

    const { 
        user, setUser,
        localStreamRef, remoteStreamRef,
        callStatus, setCallStatus,
        connection,
        call,setCall,
        caller, setCaller,
        callee, setCallee,
        firestore, stopCall
    } = useContext(chatContext);

    const servers = {
        iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
        ],
        iceCandidatePoolSize: 10,
    };

    const [users,setUsers] = useState([]);
    const inputRef = useRef(null);

    // при отключении через закрытие вкладки и т.д.
    window.onbeforeunload = async ()=>{
        if (call){
            stopCall();
        }
        
        if (user){
            firestore.collection('users').doc(user.id).delete();
            setUser(null);
        }
    }

    // определяет пользователей в сети
    async function defineUsers(){
        const users1 = [];
        const usersCollection = await firestore.collection('users');

        (await usersCollection.get()).forEach(snapshot=>{
            users1.push(snapshot.ref.id);
        });


        // подписка на обновление коллекции пользователей
        usersCollection.onSnapshot(async snapshot=>{
            let users2 = [];
            snapshot.forEach(d=>{
                users2.push(d.ref.id);
            });
            setUsers(users2);
        });

        setUsers(users1);
    }

    // добавляет себя в систему(документ в коллекцию пользователей, состояние и т.д.)
    async function registerSelf(){
        const user1 = firestore.collection('users').doc();
        await user1.set({});

        // подписка на событие звонка себе
        user1.onSnapshot(async snapshot => {

            const data = snapshot.data();

            if (data?.incomingCallID){

                const call1 = firestore.collection('calls').doc(data.incomingCallID);
                setCall(call1);
                call1.onSnapshot(async snapshot1 => {
                    const data = snapshot1.data();

                })

                setCallee(user1);
                const caller1 = firestore.collection('users').doc(data?.callerID);
                setCaller(caller1);

                setCallStatus('incoming');
            }
        });

        setUser(user1);
    }
    
    // подключение в сеть
    async function connect(permissions){        
        localStreamRef.current = await navigator.mediaDevices
        .getUserMedia({ 
            video: permissions[0].state ==='granted', 
            audio: permissions[1].state === 'granted' 
        });
        await registerSelf();
        await defineUsers();
    }

    // проверка разрешений и подключение
    async function connectHandler(){

        if (navigator.permissions){


            const camera = await navigator.permissions.query({name:'camera'});
            const microphone = await navigator.permissions.query({name:'microphone'});

            if (camera.state === 'granted' || microphone.state === 'granted'){
                // случай когда хотя бы один поток доступен
                connect([camera,microphone]);
                
            }else{
                // Не доступны потоки
                console.log('not enough permissions to communicate');
                
                alert('Чтобы общаться, необходимо разрешить доступ к камере или микрофону(лучше оба). Сделать это можно в настройках');
            }
        }else{
            alert('Похоже, ваш браузер не поддерживает уведомления. Попробуйте зайти через другой браузер');
        }
    }

    // исходящий звонок
    async function callHandler(){
        setCallStatus('outgoing');

        const caller1 = firestore.collection('users').doc(user.id);
        const callee1 = firestore.collection('users').doc(inputRef.current.value);

        if (!users.includes(callee1.id)){
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

        user.onSnapshot = null;
        firestore.collection('users').doc(user.id).delete();
        setUser(null);

        setUsers([]);
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
                <UsersList users={users}/>
                {callStatus === 'incoming' && call && <IncomingCall firestore={firestore}/>}
                {user && <Videos localStream={localStreamRef.current} remoteStream={remoteStreamRef.current}/>}
                <div className="buttons-wrapper">
                    <div className="buttons-container">
                        <button onClick={connectHandler} disabled={user}>Подключиться</button>
                        <button onClick={callHandler} disabled={!(user && !call)}>Позвонить</button>
                        <button onClick={hangUpHandler} disabled={!(call && callStatus === 'accepted' || callStatus === 'outgoing')}>Сбросить</button>
                        <button onClick={disconnectHandler} disabled={!user}>Отключиться</button>
                        <input ref={inputRef} type="text" placeholder="ID абонента"></input>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;