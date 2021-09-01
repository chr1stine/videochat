import React, { useEffect, useRef, useContext } from 'react';
import chatContext from '../chatContext';

const Videos = ()=>{

    const { localStream, remoteStream, user, callStatus } = useContext(chatContext);

    const myVideo = useRef(null);
    const peerVideo = useRef(null);

    useEffect(()=>{
        myVideo.current.srcObject = localStream;
        peerVideo.current.srcObject = remoteStream;
    },[localStream, remoteStream]);


    return(
        <div className="videos-wrapper">
            <div className="videos-container">
                <video ref={myVideo} width="346" height="260" id="myVideo" autoPlay></video>
                <video ref={peerVideo} width="346" height="260" id="peerVideo" autoPlay></video>
                <div className="status-container">
                    <h4> Ваш ID: {user.id} </h4>
                    <h5> {callStatus} </h5>
                </div>
            </div>
        </div>
    )
}

export default Videos;