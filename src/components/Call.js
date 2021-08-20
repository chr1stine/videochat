import React, { useContext } from 'react';
import chatContext from '../chatContext';

const Call = ({inputRef})=>{

    const { firestore, connection, servers, remoteStreamRef, localStreamRef, user, call, setCall, setCallStatus, setCalleeID, setCallerID, usersIds, stopCall } = useContext(chatContext);


    // исходящий звонок
    async function callHandler(){
        setCallStatus('outgoing');

        const caller1 = firestore.collection('users').doc(user.id);
        const callee1 = firestore.collection('users').doc(inputRef.current.value);

        // не найдено абонента
        if (!((await callee1.get()).exists)){
            setCallStatus('callee with given id not found');
            return;
        }

        // нельзя позвонить себе
        if (caller1.id === callee1.id){
            setCallStatus('you can\'t call yourself');
            return;
        }


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

        
        setCalleeID(callee1);
        setCallerID(caller1);
        setCall(call1);
    }

    return (
        <button className='btn btn-primary' onClick={callHandler} disabled={!(user && !call)}>Позвонить</button>
    )
}

export default Call;