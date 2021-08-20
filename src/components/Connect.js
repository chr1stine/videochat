import React, { useContext } from 'react';
import chatContext from '../chatContext';

const Connect = ()=>{
    
    const {firestore, user, setUser, setUsersIds, localStreamRef } = useContext(chatContext);

    
    // определяет пользователей в сети
    async function defineUsers(){
        const users1 = [];
        const usersCollection = await firestore.collection('users');

        (await usersCollection.get()).forEach(snapshot=>{
            users1.push(snapshot.ref.id);
        });

        // подписка на обновление коллекции пользователей
        usersCollection.onSnapshot(async snapshot=>{
            let users2 = [];
            snapshot.forEach(d=>{
                users2.push(d.ref.id);
            });
            setUsersIds(users2);
        });

        return users1;
    }

    // добавляет себя в систему(документ в коллекцию пользователей, состояние и т.д.)
    async function registerSelf(){
        const user1 = firestore.collection('users').doc();
        await user1.set({});

        // подписка на событие звонка себе
        user1.onSnapshot(async snapshot => {

            const data = snapshot.data();

            if (data?.incomingCallID){

                const call1 = firestore.collection('calls').doc(data.incomingCallID);
                setCall(call1);
                // call1.onSnapshot(async snapshot1 => {
                //     const data = snapshot1.data();

                // })

                setCallee(user1);
                const caller1 = firestore.collection('users').doc(data?.callerID);
                setCaller(caller1);

                setCallStatus('incoming');
            }
        });

        console.log('user',user);

        return user1;
    }

    // подключение в сеть
    async function connect(video, audio){     
        
        localStreamRef.current = await navigator.mediaDevices
        .getUserMedia({ 
            video,
            audio 
        });
        
        const user1 = await registerSelf();
        setUser(user1);

        const users1 = await defineUsers();
        setUsersIds(users1);
    }

    // проверка разрешений и подключение
    async function connectHandler(){

        const cameraPermission = await navigator.permissions.query({name: 'camera'});
        const microphonePermission = await navigator.permissions.query({name: 'microphone'});

        if (cameraPermission.state === 'denied' && microphonePermission.state === 'denied'){
            alert('Необходимо разрешение на использование камеры или микрофона(лучше оба)');
        }else{
            
            const video = ['granted','prompt'].includes(cameraPermission.state);
            const audio = ['granted','prompt'].includes(microphonePermission.state);

            connect(video,audio);
        }
    }

    return (
        <button className='btn btn-primary' onClick={connectHandler} disabled={user}>Подключиться</button>
    )
}

export default Connect;