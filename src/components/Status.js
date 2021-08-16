import React, { useContext, useState } from 'react';
import chatContext from '../chatContext';

const Status = ()=>{

    const {callStatus} = useContext(chatContext);

    const [text, setText] = useState(callStatus);

    switch(callStatus){
        case 'incoming':
            setText('Входящий звонок');
            break;
        case 'outgoing':
            setText('Исходящий звонок');
            break;
        case 'declined':
            setText('Звонок был сброшен');
            break;
        case 'accepted':
            setText('Звонок был принят');
            break;
        case 'hanged up':
            setText('Звонок был завершен');
            break;
        default: break;
    }

    return(
        <div className="status-container">
            <h2>
                {text}
            </h2>
        </div>
    );
}

export default Status;