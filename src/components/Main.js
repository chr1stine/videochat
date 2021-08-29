import React, { useContext, useEffect } from 'react';
import chatContext from '../chatContext';
import Videos from './Videos';
import IncomingCall from './IncomingCall';
import HangUp from './HangUp';
import Disconnect from './Disconnect';
import Call from './Call';
import UsersList from './UsersList';

const Main = ()=>{

    const { user, usersIds, setUsersIds, callStatus, defineUsers} = useContext(chatContext);

    // обработка события сброса звонка
    async function hangUpHandler(){
        let status = callStatus === 'outgoing' ? 'canceled' : 'hanged up'
        await call.update({
            status
        });
    }

    return (
        <div className="container">

            { user && usersIds && <UsersList /> }

            { callStatus === 'incoming' && <IncomingCall />}
            
            { user && <Videos />}

            <div className="buttons-wrapper">
                <div className="buttons-container">
                    {/* <button className="btn btn-primary" onClick={async ()=> setLoginRequest(true)}>Войти</button> */}
                    <Call />
                    <HangUp hangUpHandler={hangUpHandler}/>
                    <Disconnect hangUpHandler={hangUpHandler}/>
                </div>
            </div>
        </div>
    )
}

export default Main;