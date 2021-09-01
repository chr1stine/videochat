import React, {useContext} from 'react';
import chatContext from '../chatContext';

const Logout = ()=>{

    const { user, logout } = useContext(chatContext);
    
    return (
        <button 
            className='btn btn-primary' 
            onClick={async ()=>{await logout()}} 
            disabled={!user}>
                Выйти
        </button>
    )
}

export default Logout;