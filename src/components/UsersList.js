import React, { useContext } from 'react';
import chatContext from '../chatContext';


const UsersList = ({users})=>{

    const {user} = useContext(chatContext);

    return(
        <div className="usersList-wrapper">
            <div className="usersList-container">
                <h2>Подключенные пользователи</h2>
                <ul>
                   {users.map(user1 => {
                        return (
                            <li key={user1}>
                                {`${user1}${user1===user ? '(Вы)' : ''}`}
                            </li>
                        );
                    })
                    }
                </ul>
            </div>
        </div>
    );
};

export default UsersList;