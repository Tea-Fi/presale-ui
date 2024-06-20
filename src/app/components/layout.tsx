import React, { useLayoutEffect } from 'react';
import { TopBar } from './top-bar';
import { Outlet, useNavigate } from 'react-router-dom';
import { LoginStatus, useUserContext } from '../context/user.context';

export const Layout = () => {
  const navigate = useNavigate();
  const { status } = useUserContext();

  useLayoutEffect(() => {
    if (status === LoginStatus.LOGGED_OUT) {
      navigate('/');
    }
  }, [navigate, status]);

  if (status === null) {
    return null;
  }

  return (
    <div className="main-layout">
      {status === LoginStatus.LOGGED_IN && <TopBar />}
      <main>
        <Outlet />
      </main>
    </div>
  );
};
