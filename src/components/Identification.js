import React, { useState, useContext, useRef, useEffect } from 'react';
import chatContext from '../chatContext';
import User from './User';

const Identification = ()=>{

    const { usersIds, setUsersIds, firestore, setUser, defineUsers, getMedia, login } = useContext(chatContext);

    const [savedUsers,setSavedUsers] = useState(null);
    
    const [rememberUser, setRememberUser] = useState(false);

    useEffect(()=>{

        if (!usersIds){
            const definingUsers = async ()=>{
                const users = await defineUsers();
                setUsersIds(users);
            }

            definingUsers();
        }     
        
        if (!savedUsers){
            let savedUsers1 = recallSavedUsers()
            setSavedUsers(savedUsers1);
        }
    },[usersIds]);
    
    const [style,setStyle] = useState({ display: "none" });
    const [nameIsUnique,setNameIsUnique] = useState(null);

    const nameRef = useRef(null);

    // возвращает пользователей, раннее зарегистрированных через этот браузер
    function recallSavedUsers(){
        const users = JSON.parse(localStorage.getItem("usersIds"));

        if (users){
            users.map(prevUserId => {
                return prevUserId
            });
        }else{
            return null;
        }

        return users;
    }

    // добавляет себя в систему(документ в коллекцию пользователей, состояние и т.д.)
    async function register(userId){

        const user1 = firestore.collection('users').doc(userId);
        await user1.set({rememberUser});

        // добавление в локальное хранилище
        if (rememberUser){
            let usersIds1 = JSON.parse(localStorage.getItem("usersIds"));
            if (!(usersIds1)){
                usersIds1 = [];
            }
            localStorage.setItem("usersIds",JSON.stringify([...usersIds1, user1.id]));
        }

        // подписка на событие звонка себе
        user1.onSnapshot(async snapshot => {

            const data = snapshot.data();

            if (data?.incomingCallID){

                const call1 = firestore.collection('calls').doc(data.incomingCallID);
                setCall(call1);

                setCalleeID(user1);

                const caller1 = firestore.collection('users').doc(data?.callerID);
                setCallerID(caller1);

                setCallStatus('incoming');
            }
        });

        console.log('user document is ',user1);
    }

    async function newUserClickHandler(){
        setStyle({ display: "block" });
    }

    async function userNameChangeHandler(event){
        const val = event.target.value;
        if (val != ''){
            if (usersIds.includes(val)){
                setNameIsUnique(false);
            }else{
                setNameIsUnique(true);
            }
        }else{
            setNameIsUnique(null);
        }
    }

    async function randomNameClickHandler(){
        const user1 = firestore.collection('users').doc();
        const userId = user1.id;
        await user1.set({});
        nameRef.current.value = userId;
        setNameIsUnique(true);
    }

    async function okClickHandler(){
        const userId = nameRef.current.value;
        await register(userId);
        await login(userId);
    }

    return (
        <div className={`modal-wrapper`}>
            <div className="modal-container">

                <label>Войти как:</label>

                {
                    savedUsers?.map(u=>{
                        if (u)
                        return <User key={u} userId={u} />
                    })
                }

                <button className="btn btn-outline-primary" onClick={newUserClickHandler}>+ Новый пользователь</button>

                <div className="new-user-container" style={style}>
                    <label>Ваше имя:</label>

                    <input ref={nameRef} onChange={userNameChangeHandler} className="form-control input" type="text"/>

                    <div className="new-user-buttons-container">
                        <button className="btn btn-primary" disabled={!(nameIsUnique === true)} onClick={okClickHandler}>Ок</button>
                        <button className="btn btn-info" onClick={randomNameClickHandler}>Случайное</button>
                    </div>

                    <p style={{color: nameIsUnique === true ? 'green' : 'red'}}>{nameIsUnique ? 'Имя свободно': nameIsUnique === false ? 'Имя занято' : ''}</p>
                    <div className="form-check">
                        <input type="checkbox" autoComplete="off" checked={rememberUser} onChange={()=>{setRememberUser(!rememberUser)}} /> Запомнить меня
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Identification;