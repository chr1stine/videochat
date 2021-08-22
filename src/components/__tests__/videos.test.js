import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import Videos from '../Videos';
import '@testing-library/jest-dom'

it("Videos renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<Videos />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});