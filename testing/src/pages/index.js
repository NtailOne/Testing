import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home({ serverURL }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(serverURL + 'home')
      .then(res => setData(res.data.express))
      .catch(err => console.log(err));
  }, [serverURL]);

  return (
    <div>
      <h1>Welcome to GeeksforGeeks</h1>
      <br />
      <p>{data}</p>
    </div>
  );
};