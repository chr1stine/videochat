import React, { useContext, useEffect, useState } from 'react';
import chatContext from '../chatContext';
import Videos from './Videos';
import IncomingCall from './IncomingCall';
import HangUp from './HangUp';
import Logout from './Logout';
import Call from './Call';
import UsersList from './UsersList';

const Main = ()=>{

    const { user, callStatus } = useContext(chatContext);

    return (
        <div className="container">

            { user && <UsersList /> }

            { callStatus === 'Входящий звонок' && <IncomingCall />}
            
            { user && <Videos />}

            <div className="buttons-wrapper">
                <div className="buttons-container">
                    <Call />
                    <HangUp />
                    <Logout />
                </div>
            </div>
        </div>
    )
}

export default Main;