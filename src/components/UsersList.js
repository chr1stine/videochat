import React, { useContext } from 'react';
import chatContext from '../chatContext';


const UsersList = ()=>{

    const { user, onlineUsersIds } = useContext(chatContext);

    function usersIdsListItems(){
        const lis = [];
        onlineUsersIds?.forEach(userId=>{

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

        if (lis.length){
            return lis
        }else{
            'Нет подключенных пользователей'
        }
    }

    const content = usersIdsListItems();

    return(
        <div className="usersIdsList-wrapper">
            <div className="usersIdsList-container">
                <h2>Подключенные пользователи</h2>
                <ul>
                   { content }
                </ul>
            </div>
        </div>
    );
};

export default UsersList;