import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import Identification from '../Identification';
import '@testing-library/jest-dom'

it("Identification renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<Identification />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});