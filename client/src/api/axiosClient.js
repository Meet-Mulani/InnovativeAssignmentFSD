import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', //first grab from env file then try to get localhost 5000
  headers: {
    'Content-Type': 'application/json', // headers in request will be in json from unit 1
  },
});

axiosClient.interceptors.request.use( //interceptors will help to get token from local storage and add it to the request headers
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; //if token is found add it to the request headers 
    }
    return config;
  },
  (error) => Promise.reject(error) //app which imports axiosclient will handle this
);

export default axiosClient; //helps other files to import axiosclient

// bearer is used to state the backend that user has access

