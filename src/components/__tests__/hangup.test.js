import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import HangUp from '../HangUp';
import '@testing-library/jest-dom'

it("hangup renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<HangUp />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});