import React, { useContext } from 'react';
import chatContext from '../chatContext';


const UsersList = ()=>{

    const {user, usersIds} = useContext(chatContext);

    function usersIdsListItems(){
        const lis = [];
        usersIds.forEach(userId=>{

            let str = userId;
            if(userId===user.id){
                str += '(Вы)';
            }

            lis.push(
                <li key={userId}>
                    { str }
                </li>
            );

        });
        return lis;
    }

    return(
        <div className="usersIdsList-wrapper">
            <div className="usersIdsList-container">
                <h2>Подключенные пользователи</h2>
                <ul>
                   { usersIdsListItems() }
                </ul>
            </div>
        </div>
    );
};

export default UsersList;