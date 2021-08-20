import React, { useContext } from 'react';
import chatContext from '../chatContext';

const HangUp = ({hangUpHandler})=>{

    const { call, callStatus } = useContext(chatContext);

    return(
        <button className='btn btn-primary' onClick={hangUpHandler} disabled={!(call && callStatus === 'accepted' || callStatus === 'outgoing')}>Сбросить</button>
    )
}

export default HangUp;