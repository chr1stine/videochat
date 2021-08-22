import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import Status from '../Status';
import '@testing-library/jest-dom'

it("Status renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<Status />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});