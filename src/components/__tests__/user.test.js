import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import User from '../User';
import '@testing-library/jest-dom'

it("User renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<User />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});