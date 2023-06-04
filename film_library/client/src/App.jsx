import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';


import { useEffect, useState } from "react";


import MyNavBar from './components/NavigationBar.jsx';
import MainPage from './routes/MainPage.jsx';
import MyForm from './routes/MyForm.jsx';
import DefaultRoute from './routes/DefaultRoute.jsx';

import { LoginForm } from './routes/Login.jsx';

import API from './API.jsx';


function App() {

  const [editObj, setEdit] = useState(undefined);

  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);

  const [updated, setUpdated] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        // NO need to do anything: user is simply not yet authenticated
        //handleError(err);
      }
    };
    checkAuth();
  }, []);

  const loginSuccessful = (user) => {
    console.log("why here");
    setUser(user);
    setLoggedIn(true);
    setUpdated(true);  // load latest version of data, if appropriate
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    /* set state to empty if appropriate */
  }

  return (

    <BrowserRouter>
      <Routes>

        <Route path="/" element={loggedIn ? <MyNavBar user={user} logout={doLogOut} /> : <Navigate replace to='/login' />} >

          <Route index element={
            <MainPage setEdit={setEdit} setUpdated={setUpdated} updated={updated} user={user} />} />

          <Route path='add' element={<MyForm editObj={editObj} setEdit={setEdit} user={user} />} />


          <Route path='edit/:filmId' element={<MyForm editObj={editObj} setEdit={setEdit} user={user} />} />

          <Route path=":filterName" element={<MainPage setEdit={setEdit} user={user} setUpdated={setUpdated} updated={updated} />} />

        </Route>
        <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm loginSuccessful={loginSuccessful} />} />

        <Route path='*' element={<DefaultRoute />} />
      </Routes>

    </BrowserRouter>
  )


}








export default App
