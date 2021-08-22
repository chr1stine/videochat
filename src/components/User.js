import React, {useContext} from 'react';
import chatContext from '../chatContext';

const User = ({userId})=>{

    const { login } = useContext(chatContext);

    return(
        <a href="#" className="list-group-item list-group-item-action" onClick={async ()=>await login(userId)}>
            {userId}
        </a>
    )
}

export default User;