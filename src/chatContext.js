import React, { createContext, useRef, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore'
import firebaseConfig from './firebaseConfig';

const chatContext = createContext({});

export default chatContext;

// export const ChatProvider = chatContext.Provider;
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
    const localStreamRef = useRef(new MediaStream());
    const remoteStreamRef = useRef(new MediaStream());
    const [user,setUser] = useState(null);
    const [calleeID,setCalleeID] = useState(null);
    const [callerID,setCallerID] = useState(null);
    const [usersIds,setUsersIds] = useState(null);
    const [rememberUser, setRememberUser] = useState(false);
    
    // останавливает соединение с любой стороны
    function stopCall(){
        setCallerID(null);
        setCalleeID(null);
        remoteStreamRef.current = new MediaStream();

        if (connection.current){
          connection.current.close();
        }

        if (call){
          deleteCallDocument();
        }
        setCall(null);
    }
    
    // удаляет документ текущего звонка
    async function deleteCallDocument(){
        call.onSnapshot = null;

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

    // вход зарегистрированного пользователя
    async function login(userId){

        // активация документа пользователя в облачном хранилище
        const user1 = firestore.collection('users').doc(userId);
        await user1.update({
            online: true
        });

        console.log('document of this user is ',user1);

        // добавление в сессионное хранлище
        sessionStorage.setItem("currentUserId",user1.id);

        // изменение состояния user
        setUser(user1);

        // получение списка пользователей
        setUsersIds(await getUsersIds());

        // получение медиа
        await getMedia();
    }
    
    // получение медиа
    async function getMedia(){
        const cameraPermission = await navigator.permissions.query({name: 'camera'});
        const microphonePermission = await navigator.permissions.query({name: 'microphone'});

        if (cameraPermission.state === 'denied' && microphonePermission.state === 'denied'){
            alert('Необходимо разрешение на использование камеры или микрофона(лучше оба)');
        }else{
            
            const video = ['granted','prompt'].includes(cameraPermission.state);
            const audio = ['granted','prompt'].includes(microphonePermission.state);
            
            localStreamRef.current = await navigator.mediaDevices
            .getUserMedia({ 
                video,
                audio
            });
        }
    }

    
    // добавляет себя в систему(документ в коллекцию пользователей, состояние и т.д.)
    async function register(userId){

        const user1 = firestore.collection('users').doc(userId);
        await user1.set({rememberUser});

        // добавление в локальное хранилище
        if (rememberUser){
            let usersIds1 = JSON.parse(localStorage.getItem("usersIds"));
            if (!(usersIds1)){
                usersIds1 = [];
            }
            localStorage.setItem("usersIds",JSON.stringify([...usersIds1, user1.id]));
        }

        // подписка на событие звонка себе
        user1.onSnapshot(async snapshot => {

            const data = snapshot.data();

            if (data?.incomingCallID){

                const call1 = firestore.collection('calls').doc(data.incomingCallID);
                setCall(call1);

                setCalleeID(user1);

                const caller1 = firestore.collection('users').doc(data?.callerID);
                setCallerID(caller1);

                setCallStatus('incoming');
            }
        });
    }

    // возвращает других пользователей в сети
    async function getUsersIds(){
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
            setUsersIds(users2);
        });

        return users1;
    }

    async function disconnect(){
        if (call){
            hangUpHandler();
        }

        localStreamRef.current.getTracks().forEach(function(track) {
            track.stop();
        });

        sessionStorage.removeItem("currentUserId");

        const user1 = firestore.collection('users').doc(user.id)
        const data = (await user1.get()).data();
        const needToRemember = data?.rememberUser;
        if(!needToRemember){
            user1.delete();
        }

        setUser(null);

        setUsersIds(null);
    }

    async function reserveRandomId(){
        const randomDoc = firestore.collection('users').doc();
        await randomDoc.set({});
        return randomDoc.id;
    }

    async function clean(){
        // TODO: delete unnecessary user documents - without online and rememberUser field
    }

    return (
      <chatContext.Provider value={{user,setUser,localStreamRef, remoteStreamRef, callStatus, setCallStatus, call,setCall,connection,callerID,setCallerID,calleeID,setCalleeID, firestore, stopCall, deleteCallDocument, usersIds, setUsersIds, login, getMedia, getUsersIds, disconnect, register, reserveRandomId, clean}}>
        {children}
      </chatContext.Provider>
    );
};