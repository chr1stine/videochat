import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import IncomingCall from '../IncomingCall';
import '@testing-library/jest-dom'

it("Incomingcall renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<IncomingCall />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});