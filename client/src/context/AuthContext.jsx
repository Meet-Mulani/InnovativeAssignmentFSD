import React, { createContext, useState, useEffect } from 'react'; //counter part of useContext
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext(null); //it creates the actual memory bucket 

//https://gist.github.com/diegopitt/c2a93b1e745d9d952cfbc4c16b53bb06
//https://blog.devgenius.io/how-to-create-and-use-react-context-57e3a9bcaada

export const AuthProvider = ({ children }) => { // here children is the entire application
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null); //
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosClient.get('/auth/me'); // axiosclient intercepts the request and attaches token
        setUser(res.data.user);
      } catch (error) {
        console.error('Session expired or invalid token');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await axiosClient.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user); // helps navbar update
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return ( //wrapper component
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}> {/*this is what gets dump in memory bucket*/}
      {!loading && children} {/* prevents UI splash, shows content only when auth is done*/}
    </AuthContext.Provider>
  );
};