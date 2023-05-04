import React, { useContext } from 'react';
import LoginForm from '../components/LoginForm';
import Context from '../components/Context';

const Login = () => {
  const { serverURL } = useContext(Context);
  return (
    <div className="row justify-content-center">
      <LoginForm serverURL={serverURL} />
    </div>
  );
};

export default Login;