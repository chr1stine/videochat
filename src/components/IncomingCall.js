import React, { useContext, useEffect } from 'react';
import chatContext from '../chatContext';

const IncomingCall = ()=>{

    const servers = {
        iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
        ],
        iceCandidatePoolSize: 10,
    };

    const {
        user,
        localStreamRef,
        remoteStreamRef,
        callStatus, setCallStatus,
        connection,
        call, setCall,
        caller, setCaller,
        callee,setCallee,
        firestore,
        stopCall} = useContext(chatContext);

    // подписка на события звонка
    call.onSnapshot(async snapshot => {
        if (snapshot.exists){
            const data = snapshot.data();                
            if (!connection.current?.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                connection.current?.setRemoteDescription(answerDescription);
            }

            if (data.status === 'hanged up'){
                stopCall();
                setCallStatus(data.status);
            }

            if (data.status === 'accepted'){
                setCallStatus('accepted');
            }

            if (data.status === 'canceled'){
                stopCall();
                setCallStatus('canceled');
            }
            
            if (data.status === 'declined'){
                stopCall();
                setCallStatus('declined');
            }
        }
    });
    

    // принятие звонка
    async function acceptHandler(){

        setCallStatus('accepted');

        connection.current = await new RTCPeerConnection(servers);

        localStreamRef.current.getTracks().forEach(track=>{
            connection.current.addTrack(track,localStreamRef.current);
        });
        
        connection.current.ontrack = event =>{
            event.streams[0].getTracks().forEach(track=>{
                remoteStreamRef.current.addTrack(track);
            });
        }
        
        // подписка на получение новой ICE-конфигурации на своей стороне
        const answerCandidates = call.collection('answerCandidates');
        connection.current.onicecandidate = (event) => {
            event.candidate && answerCandidates.add(event.candidate.toJSON());
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
        await call.update({ answer, status: 'accepted' });
    

        // подписка на получение новой ICE-конфигурации собеседника
        const offerCandidates = call.collection('offerCandidates');
        offerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    connection.current.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
    }

    // отклонение звонка
    function declineHandler(){
        call.update({
            status: 'declined'
        });
    }

    return(
        <div className='notification-wrapper'>
            <div className="notification-container">
                <p>
                    Вам звонит {caller?.id}
                </p>
                <div className="notification-buttons-container">
                    <button className='btn btn-success' onClick={acceptHandler}>Принять</button>
                    <button className='btn btn-danger' onClick={declineHandler}>Отклонить</button>
                </div>
            </div>
        </div>
    )
}

export default IncomingCall;