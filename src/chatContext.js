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
    const [loginRequest,setLoginRequest] = useState(false);
    
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
        setUsersIds(await defineUsers());

        // получение медиа
        await getMedia();

        // вход был произвден, можно грузить приложение
        setLoginRequest(false);
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

    // возвращает других пользователей в сети
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
            setUsersIds(users2);
        });

        return users1;
    }

    return (
      <chatContext.Provider value={{user,setUser,localStreamRef, remoteStreamRef, callStatus, setCallStatus, call,setCall,connection,callerID,setCallerID,calleeID,setCalleeID, firestore, stopCall, deleteCallDocument, usersIds, setUsersIds, loginRequest,setLoginRequest, login, getMedia, defineUsers}}>
        {children}
      </chatContext.Provider>
    );
};