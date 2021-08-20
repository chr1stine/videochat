import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import Input from '../Input';
import '@testing-library/jest-dom'

it("input renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<Input />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});