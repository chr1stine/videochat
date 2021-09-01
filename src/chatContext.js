import React, { createContext, useEffect, useRef, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore'
import firebaseConfig from './firebaseConfig';

const chatContext = createContext({});

export default chatContext;

export const ChatProvider = ({ children }) => {
  

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }else {
        firebase.app(); // if already initialized, use that one
    }

    const firestore = firebase.firestore();

    const [call,setCall] = useState(null);
    const connection = useRef(null);
    const [callStatus, setCallStatus] = useState(null);
    const [localStream,setLocalStream] = useState(new MediaStream());
    const [remoteStream,setRemoteStream] = useState(new MediaStream());
    const [user,setUser] = useState(null);
    const [callee,setCallee] = useState(null);
    const [caller,setCaller] = useState(null);
    const [usersIds,setUsersIds] = useState(null);
    const [onlineUsersIds, setOnlineUsersIds] = useState(null);

    // подписка на изменения коллекции пользователей
    useEffect(async ()=>{
        const usersCollection = await firestore.collection('users');
        
        usersCollection.onSnapshot(snapshot=>{
            let usersIds1 = [];
            let onlineUsersIds1 = [];
            
            snapshot.forEach(d=>{

                usersIds1.push(d.ref.id);

                const data = d.data();
                if (data.online && data.online != 'temp'){
                    onlineUsersIds1.push(d.ref.id);
                }
            });

            setUsersIds(usersIds1);
            setOnlineUsersIds(onlineUsersIds1);
        });
    },[]);    

    // сохранённые пользователи
    function getRememberedUsersIds(){
        const ids = [];
        for(let i = 0; i < localStorage.length; i++){
            ids.push(localStorage.key(i));
        }
        
        return ids;
    }
    
    // регистрация
    async function signUp(userId, remember){

        const user1 = firestore.collection('users').doc(userId);
        if (!user1.exists){
            await user1.set({});
        }
        await user1.update({ remember });

        // добавление в локальное хранилище
        if (remember){
            localStorage.setItem(user1.id,"online");
        }
    }

    // вход зарегистрированного пользователя
    async function login(userId){


        // активация документа пользователя в облачном хранилище
        const user1 = await firestore.collection('users').doc(userId);
        await user1.update({ online: true });
        setUser(user1);

        // добавление в хранилища
        sessionStorage.setItem("current",user1.id);
        if (localStorage.getItem(user1.id)){
            localStorage.setItem(user1.id, 'online');
        }
        
        // подписка на событие звонка себе
        const callsCollection = firestore.collection('calls');
        callsCollection.onSnapshot(snapshot=>{
            snapshot.docChanges().forEach(change=>{
                if (change.type==='added' || change.type === 'modified'){
                    let data = change.doc.data();
                    if (data){
                        if (data.calleeID === user1.id){
                            setCall(change.doc.ref);
                            setCallee(user1);
                            const caller1 = callsCollection.doc(data.callerID);
                            setCaller(caller1);
                            setCallStatus('Входящий звонок');
                        }
                    }
                }
            })
        });

        // получение медиа
        await getMedia();

        setCallStatus(null);

        await cleanUp();
    }

    // получение медиа
    async function getMedia(){
        const cameraPermission = await navigator.permissions.query({name: 'camera'});
        const microphonePermission = await navigator.permissions.query({name: 'microphone'});

        if (cameraPermission.state === 'denied' && microphonePermission.state === 'denied'){
            alert('Необходимо разрешение на использование камеры или микрофона');
        }else{
            
            const video = ['granted','prompt'].includes(cameraPermission.state);
            const audio = ['granted','prompt'].includes(microphonePermission.state);
            
            const stream = await navigator.mediaDevices
            .getUserMedia({ 
                video,
                audio
            });

            setLocalStream(stream);
        }
    }

    // другие пользователи в сети
    async function getUsersIds(){
        const users1 = [];
        const usersCollection = await firestore.collection('users');

        (await usersCollection.get()).forEach(async snapshot=>{
            users1.push(snapshot.ref.id);
        });

        return users1;
    }

    // генерация случайного id
    async function reserveRandomId(){
        const randomDoc = firestore.collection('users').doc();
        await randomDoc.set({online: 'temp'});
        return randomDoc.id;
    }

    // stun-сервера, через которые будут перекидываться медиа данные между участниками
    const servers = {
        iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
        ],
        iceCandidatePoolSize: 10,
    };

    async function setUpConnection(){
        
        // локальное соединение
        connection.current = await new RTCPeerConnection(servers);


        // раздача своего потока
        localStream.getTracks().forEach(track=>{
            connection.current.addTrack(track,localStream);
        });

        // подписка на поток собеседника
        connection.current.ontrack = event =>{
            event.streams[0].getTracks().forEach(track=>{
                remoteStream.addTrack(track);
            });
        }
    }

    // принятие звонка
    async function accept(){

        setCallStatus('Звонок принят');

        await setUpConnection();        

        // подписка на получение новой ICE-конфигурации на своей стороне
        const answerCandidates = call.collection('answerCandidates');
        connection.current.onicecandidate = (event) => {
            if (event.candidate){
                answerCandidates.add(event.candidate.toJSON());
            }
        };


        // установка описания стороны собеседника
        const offerDescription = (await call.get()).data().offer;
        await connection.current.setRemoteDescription(new RTCSessionDescription(offerDescription));

        // установка описания своей стороны
        const answerDescription = await connection.current.createAnswer();
        await connection.current.setLocalDescription(answerDescription);


        // отправка ответа
        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };
        await call.update({ answer, status: 'Звонок принят' });
    

        // подписка на получение новой ICE-конфигурации собеседника
        const offerCandidates = call.collection('offerCandidates');
        offerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    if (data){
                        connection.current.addIceCandidate(new RTCIceCandidate(data));
                    }
                }
            });
        });
    }
    
    function callEventsHandler(data){  

        // если ответили на исходящий звонок
        if (!connection.current?.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            connection.current?.setRemoteDescription(answerDescription);
        }

        if (data.status === 'Звонок сброшен'){
            stopCall();
            setCallStatus(data.status);
        }

        if (data.status === 'Звонок принят'){
            setCallStatus(data.status);
        }

        if (data.status === 'Звонок отменен'){
            stopCall();
            setCallStatus(data.status);
        }
        
        if (data.status === 'Звонок отклонен'){
            if (call){
                stopCall();
            }
            setCallStatus(data.status);
        }
    }

    // исходящий звонок
    async function makeCall(callee){
        setCallStatus('Исходящий звонок');

        const caller1 = user;
        const callee1 = firestore.collection('users').doc(callee);

        if ((await callee1.get()).data().online === false){
            setCallStatus('Нельзя позвонить: пользователь не в сети');
        }

        // не найдено абонента
        if (!((await callee1.get()).exists)){
            setCallStatus('Нет пользователя с таким id');
            return;
        }

        // нельзя позвонить себе
        if (caller1.id === callee1.id){
            setCallStatus('Нельзя позвонить себе');
            return;
        }

        // установка соединения и обмен потоками
        await setUpConnection();

        // создание нового документа звонка
        const call1 = firestore.collection('calls').doc();
        call1.set({});
        await call1.update({
            calleeID: callee1.id,
            callerID: caller1.id
        });

        // подписка на появление новой ICE-конфигурации на своей стороне
        const offerCandidates = await call1.collection('offerCandidates');
        connection.current.onicecandidate = event => {
            if (event.candidate){
                offerCandidates.add(event.candidate.toJSON());
            }
        };


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
                callEventsHandler(data);
            }
        });


        // подписка на появление новой ICE-конфигурации на стороне собеседника
        const answerCandidates = await call1.collection('answerCandidates');
        answerCandidates.onSnapshot(snapshot => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    if (data && connection.current.currentRemoteDescription){
                        connection.current.addIceCandidate(new RTCIceCandidate(data));
                    }
                }
            });
        });
        
        setCallee(callee1);
        setCaller(caller1);
        setCall(call1);
    }

    // отклонение входящего звонка
    async function decline(){
        call.update({
            status: 'Звонок отклонен'
        });
        stopCall();
    }

    // сброс звонка
    async function hangUp(){
        let status = callStatus === 'Исходящий звонок' ? 'Звонок отменен' : 'Звонок сброшен'
        await call.update({
            status
        });
        stopCall();
    }

    // выход из приложения
    async function logout(accidentally){
        
        // завершить существующий звонок
        if (call){
            if (callStatus === 'Входящий звонок'){
                decline();
            }else{
                hangUp();
            }
        }

        localStream.getTracks().forEach(function(track) {
            track.stop();
        });

        if (!accidentally){
            sessionStorage.removeItem('current');
        }

        if (localStorage.getItem(user.id)){
            localStorage.setItem(user.id,'offline');
        }

        const user1 = firestore.collection('users').doc(user.id)
        const data = (await user1.get()).data();
        const remember = data?.remember;
        if(!remember){
            user1.delete();
        }else{
            user1.update({online: false});
        }
        

        setUser(null);
        setUsersIds(null);
    }

    // останавливает соединение с любой стороны
    async function stopCall(){
        setCaller(null);
        setCallee(null);

        setRemoteStream(new MediaStream());

        if (connection.current){
          connection.current.close();
        }

        // if (user.id === callee.id){
        //     await user.update({
        //         incomingCallID : null
        //     })
        // }

        if (call){
          deleteCall();
        }
        setCall(null);
    }
    
    // удаляет документ текущего звонка
    async function deleteCall(){
        // удаление обработчика звонка
        call.onSnapshot()();

        const offerCandidates = call.collection('offerCandidates');
        if (offerCandidates){
            offerCandidates.get().then(q=>{
                q.forEach(d=>{
                    d.ref.delete();
                })
            })
        }

        const answerCandidates = call.collection('answerCandidates');
        if (answerCandidates){
            answerCandidates.get().then(q=>{
                q.forEach(d=>{
                    d.ref.delete();
                })
            })
        }

        call.delete();
    }
    
    // удаляет пользователей offline, которые не rememembered
    async function cleanUp(){
        const usersCollection = await firestore.collection('users');
        (await usersCollection.get()).forEach(snapshot => {
            if (snapshot.data().online === 'temp'){
                snapshot.ref.delete();
            }
        })
    }

    return (
      <chatContext.Provider value={{user,localStream, remoteStream, callStatus, call,caller,callee, usersIds, setUsersIds, login, getUsersIds, logout, signUp, reserveRandomId, getRememberedUsersIds, onlineUsersIds, makeCall, accept, decline, callEventsHandler, hangUp }}>
        {children}
      </chatContext.Provider>
    );
};