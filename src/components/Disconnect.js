import React, {useContext} from 'react';
import chatContext from '../chatContext';

const Disconnect = ({hangUpHandler})=>{

    const { firestore, call, localStreamRef, user, setUser, setUsersIds, rememberUser } = useContext(chatContext);
    
    // отключение
    async function disconnectHandler(){

        if (call){
            hangUpHandler();
        }

        localStreamRef.current.getTracks().forEach(function(track) {
            track.stop();
        });

        sessionStorage.removeItem("currentUserId");

        const user1 = firestore.collection('users').doc(user.id)
        const data = (await user1.get()).data();
        const needToRemember = data?.rememberUser;
        if(!needToRemember){
            user1.delete();
        }

        setUser(null);

        setUsersIds(null);
    }

    return (
        <button className='btn btn-primary' onClick={disconnectHandler} disabled={!user}>Выйти</button>
    )
}

export default Disconnect;