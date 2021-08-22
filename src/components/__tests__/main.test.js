import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import Main from '../Main';
import '@testing-library/jest-dom'

it("Main renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<Main />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});