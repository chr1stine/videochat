import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import Disconnect from '../Disconnect';
import '@testing-library/jest-dom'

it("disconnect renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<Disconnect />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});