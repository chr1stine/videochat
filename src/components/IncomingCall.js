import React, { useContext, useEffect } from 'react';
import chatContext from '../chatContext';

const IncomingCall = ()=>{

    const { call, caller, decline, accept, callEventsHandler } = useContext(chatContext);

    useEffect(()=>{
        call.onSnapshot(async snapshot => {
            if (snapshot.exists){
                const data = snapshot.data();    
                callEventsHandler(data);
            }
        });
    },[]);

    return(
        <div className='notification-wrapper'>
            <div className="notification-container">
                <p>
                    Вам звонит {caller?.id}
                </p>
                <div className="notification-buttons-container">
                    <button className='btn btn-success' onClick={async ()=> accept()}>Принять</button>
                    <button className='btn btn-danger' onClick={async ()=> decline()}>Отклонить</button>
                </div>
            </div>
        </div>
    )
}

export default IncomingCall;