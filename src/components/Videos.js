import React, { useEffect, useRef } from 'react';
import Status from './Status';

const Videos = ({localStream, remoteStream})=>{

    const myVideo = useRef(null);
    const peerVideo = useRef(null);

    useEffect(()=>{
        myVideo.current.srcObject = localStream;
        peerVideo.current.srcObject = remoteStream;
    },[localStream, remoteStream]);

    return(
        <div className="videos-wrapper">
            <div className="videos-container">
                <video ref={myVideo} width="480" height="320" id="myVideo" autoPlay></video>
                <video ref={peerVideo} width="480" height="320" id="peerVideo" autoPlay></video>
                <Status />
            </div>
        </div>
    )
}

export default Videos;