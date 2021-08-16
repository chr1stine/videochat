import './style.less';
import App from './components/App';
import {render} from 'react-dom';
import React from 'react';
import "regenerator-runtime/runtime";
import { ChatProvider } from './chatContext';

render(
  
  <ChatProvider>
    <App />
  </ChatProvider>

  ,document.getElementById('root')
);