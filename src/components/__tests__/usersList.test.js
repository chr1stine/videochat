import React from 'react';
import ReactDOM from 'react-dom'
import { render, screen } from '@testing-library/react';
import UsersList from '../UsersList';
import '@testing-library/jest-dom'

it("UsersList renders without crashing",()=>{
    const div = document.createElement("div");
    ReactDOM.render(<UsersList />,div);
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
});