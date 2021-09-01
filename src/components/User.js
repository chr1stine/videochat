import React, {useContext} from 'react';
import chatContext from '../chatContext';

const User = ({userId, loggedIn})=>{

    const { login } = useContext(chatContext);

    async function userClickHandler(){
        if (loggedIn){
            alert('Этот пользователь уже вошел на этом устройстве');
        }else{
            await login(userId);
        }
    }

    return(
        <a 
            href="#" 
            className="list-group-item list-group-item-action" 
            onClick={userClickHandler}>
            {userId}
        </a>
    )
}

export default User;