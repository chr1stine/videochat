import React from 'react';

const UsersList = ({users})=>{

    return(
        <div className="usersList-wrapper">
            <div className="usersList-container">
                <ul>
                   {users.map(user => {
                        return (
                            <li key={user}>
                                {user}
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