import React, { createContext, useRef, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore'

const chatContext = createContext({});

export default chatContext;

// export const ChatProvider = chatContext.Provider;
export const ChatProvider = ({ children }) => {

  
    const firebaseConfig = {
      apiKey: "AIzaSyCUt3wHIFEeF-W9vKCjUoQusxkUVstu2so",
      authDomain: "video-chat-29dd5.firebaseapp.com",
      projectId: "video-chat-29dd5",
      storageBucket: "video-chat-29dd5.appspot.com",
      messagingSenderId: "549408870289",
      appId: "1:549408870289:web:05f3cf02381565138e9430",
      measurementId: "G-DT989GYERV"
    };

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
          setCall(null);
        }
    }
    
    // удаляет документ текущего звонка
    async function deleteCallDocument(){
      if (call){

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
    }

    return (
      <chatContext.Provider value={{user,setUser,localStreamRef, remoteStreamRef, callStatus, setCallStatus, call,setCall,connection,caller,setCaller,callee,setCallee, firestore, stopCall, deleteCallDocument}}>
        {children}
      </chatContext.Provider>
    );
  };