import React, { createContext, useRef, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore'
import firebaseConfig from 'firebaseConfig';

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
    const [callee,setCallee] = useState(null);
    const [caller,setCaller] = useState(null);

    
    // останавливает соединение с любой стороны
    function stopCall(){
        setCaller(null);
        setCallee(null);
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

    return (
      <chatContext.Provider value={{user,setUser,localStreamRef, remoteStreamRef, callStatus, setCallStatus, call,setCall,connection,caller,setCaller,callee,setCallee, firestore, stopCall, deleteCallDocument}}>
        {children}
      </chatContext.Provider>
    );
};