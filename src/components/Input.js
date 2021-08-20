import React, {useContext} from 'react';

const Input = ({inputRef})=>{
    
    return (
        <input className='form-control input' ref={inputRef} type="text" placeholder="ID абонента"></input>
    )
}

export default Input;