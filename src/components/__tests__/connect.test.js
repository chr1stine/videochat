import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import Connect from '../Connect';
import '@testing-library/jest-dom'

it("renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<Connect />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});