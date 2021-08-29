import React, {useContext} from 'react';
import chatContext from '../chatContext';

const Disconnect = ()=>{

    const { user } = useContext(chatContext);
    
    return (
        <button className='btn btn-primary' onClick={async ()=>{await disconnect()}} disabled={!user}>Выйти</button>
    )
}

export default Disconnect;