import React, { useContext } from 'react';
import chatContext from '../chatContext';

const Connect = ()=>{
    
    const { user, setLoginRequest } = useContext(chatContext);

    return (
        <button className='btn btn-primary' onClick={()=>{setLoginRequest(true)}} disabled={user}>Подключиться</button>
    )
}

export default Connect;