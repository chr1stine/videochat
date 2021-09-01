import React, { useContext, useRef } from 'react';
import chatContext from '../chatContext';

const Call = ()=>{

    const { makeCall, user, call } = useContext(chatContext);

    const inputRef = useRef(null);

    return (
        <div>
            <button 
                className='btn btn-primary' 
                onClick={async ()=>{makeCall(inputRef.current.value)}} 
                disabled={!(user || !call)}>
                    Позвонить
            </button>

            <input 
                className='form-control input' 
                ref={inputRef} 
                type="text" 
                placeholder="ID абонента">
            </input>
        </div>
    )
}

export default Call;