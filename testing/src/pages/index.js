import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Context } from '../components/Context';
import Navbar from '../components/Navbar';

const Home = () => {
  const { serverURL } = useContext(Context);

  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(serverURL + 'home')
      .then(res => setData(res.data.express))
      .catch(err => console.log(err));
  }, [serverURL]);

  return (
    <>
      <Navbar />
      <div>
        <h1>Welcome to GeeksforGeeks</h1>
        <br />
        <p>{data}</p>
      </div>
    </>
  );
};

export default Home;