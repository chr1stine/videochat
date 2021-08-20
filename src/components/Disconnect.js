import React, {useContext} from 'react';
import chatContext from '../chatContext';

const Disconnect = ({disconnectHandler})=>{

    const { user } = useContext(chatContext);

    return (
        <button className='btn btn-primary' onClick={disconnectHandler} disabled={!user}>Отключиться</button>
    )
}

export default Disconnect;