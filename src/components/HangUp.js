import React, { useContext } from 'react';
import chatContext from '../chatContext';

const HangUp = ()=>{

    const { call, callStatus, hangUp } = useContext(chatContext);

    return(
        <button 
            className='btn btn-primary' 
            onClick={async ()=>{await hangUp()}} 
            disabled={!(call && callStatus === 'Звонок принят' || callStatus === 'Исходящий звонок')}>
                Сбросить
        </button>
    )
}

export default HangUp;