import React from 'react';
import { Link } from 'react-router-dom';
import { SlButton } from '@shoelace-style/shoelace/dist/react';

export const NotFound = () => {
  return (
    <div className="not-found page">
      <h1>Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="home" replace><SlButton variant="primary" size="small">Home</SlButton></Link>
    </div>
  );
};
