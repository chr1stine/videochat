import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import Call from '../Call';
import '@testing-library/jest-dom'

it("call renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<Call />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});