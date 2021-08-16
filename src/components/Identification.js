import React, { useState } from 'react';

const Identification = ({showModal, setThisUser})=>{

    let [enabled,setEnabled] = useState(false);

    async function changeUserNameInputBox(){
        const input = document.getElementById('userNameInputBox');
        const button = document.getElementById('setUserNameOkButton');

        setEnabled(input.value);
    }

    function okClickHandler(e){
        const input = document.getElementById('userNameInputBox');
        setThisUser(input.value);
    }

    return (
        <div className={`modal-wrapper ${showModal == true?'':'hidden'}`}>
            <div className="modal-container">
                <p>Ваше имя:</p>

                <input id='userNameInputBox' type="text"
                 onChange={changeUserNameInputBox}></input>

                <button id='setUserNameOkButton' onClick={okClickHandler} disabled={!enabled}>Ок</button>
            </div>
        </div>
    );
}

export default Identification;