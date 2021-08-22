import React, { useEffect, useRef, useContext } from 'react';
import Status from './Status';
import chatContext from '../chatContext';

const Videos = ()=>{

    const { localStreamRef, remoteStreamRef } = useContext(chatContext);

    const myVideo = useRef(null);
    const peerVideo = useRef(null);

    useEffect(()=>{
        myVideo.current.srcObject = localStreamRef.current;
        peerVideo.current.srcObject = remoteStreamRef.current;
    },[localStreamRef.current, remoteStreamRef.current]);

    console.log('local stream is ',localStreamRef.current);

    return(
        <div className="videos-wrapper">
            <div className="videos-container">
                <video ref={myVideo} width="346" height="260" id="myVideo" autoPlay></video>
                <video ref={peerVideo} width="346" height="260" id="peerVideo" autoPlay></video>
                <Status />
            </div>
        </div>
    )
}

export default Videos;