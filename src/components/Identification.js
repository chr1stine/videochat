import React, { useState, useContext, useRef, useEffect } from 'react';
import chatContext from '../chatContext';
import User from './User';

const Identification = ()=>{

    const { usersIds, setUsersIds, getUsersIds, login, register, reserveRandomId } = useContext(chatContext);

    const [rememberedUsersIds,setRememeberedUsersIds] = useState(null);
    
    const [rememberUser, setRememberUser] = useState(false);

    useEffect(()=>{

        if (!usersIds){
            const gettingUsersIds = async ()=>{
                const usersIds1 = await getUsersIds();
                setUsersIds(usersIds1);
            }

            gettingUsersIds();
        }     
        
        if (!rememberedUsersIds){
            const rememberedUsersIds1 = getRememberedUsersIds();
            setRememeberedUsersIds(rememberedUsersIds1);
        }

    },[usersIds, rememberedUsersIds]);
    
    const [style,setStyle] = useState({ display: "none" });
    const [nameIsUnique,setNameIsUnique] = useState(null);

    const nameRef = useRef(null);

    // возвращает пользователей, раннее зарегистрированных через этот браузер
    function getRememberedUsersIds(){
        const rememberedUsersIds1 = JSON.parse(localStorage.getItem("usersIds"));

        if (rememberedUsersIds1){
            rememberedUsersIds1.map(id => {
                return id
            });
        }else{
            return null;
        }

        return rememberedUsersIds1;
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
        const userId = await reserveRandomId();
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
                    rememberedUsersIds?.map(userId1=>{
                        if (userId1)
                        return <User key={userId1} userId={userId1} />
                    })
                }

                <button 
                    className="btn btn-outline-primary" 
                    onClick={newUserClickHandler}>
                        + Новый пользователь
                </button>


                <div className="new-user-container" style={style}>
                    
                    <label>Ваше имя:</label>

                    <input ref={nameRef} onChange={userNameChangeHandler} className="form-control input" type="text"/>

                    <div className="new-user-buttons-container">


                        <button
                         className="btn btn-primary" 
                         disabled={!(nameIsUnique === true && usersIds)} 
                         onClick={okClickHandler}>
                             Ок
                        </button>


                        <button
                         className="btn btn-info" 
                         onClick={randomNameClickHandler}>
                             Случайное
                        </button>


                    </div>

                    <p
                     style={{color: nameIsUnique === true ? 'green' : 'red'}}>
                         {nameIsUnique ? 'Имя свободно': nameIsUnique === false ? 'Имя занято' : ''}
                    </p>
                    
                    <div className="form-check">
                        <input
                         type="checkbox" 
                         autoComplete="off" 
                         checked={rememberUser} 
                         onChange={()=>{setRememberUser(!rememberUser)}} /> 
                            Запомнить меня
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Identification;