import React, { useContext, useState } from 'react';
import chatContext from '../chatContext';

const Status = ()=>{

    const {user,callStatus} = useContext(chatContext);

    let line;
    switch(callStatus){
        case 'incoming':
            line = 'Входящий звонок';
            break;
        case 'outgoing':
            line = 'Исходящий звонок'
            break;
        case 'declined':
            line = 'Звонок был отклонён';
            break;
        case 'accepted':
            line = 'Звонок был принят';
            break;
        case 'hanged up':
            line = 'Звонок был завершен';
            break;
        case 'canceled':
            line = 'Звонок был отменен';
            break;
        case 'you can\'t call yourself':
            line = 'Нельзя позовонить себе';
            break;
        case 'callee with given id not found':
            line = 'Пользователь с таким id не найден';
            break;
        default: 
            line = callStatus;
            break;
    }

    return(
        <div className="status-container">
            <h1>
                Ваш ID: {user.id}
            </h1>
            <h2>
                {line}
            </h2>
        </div>
    );
}

export default Status;