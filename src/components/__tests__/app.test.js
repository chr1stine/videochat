import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import App from '../App';
import '@testing-library/jest-dom'

it("call renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<App />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});