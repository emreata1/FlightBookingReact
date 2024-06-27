import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { AiOutlineUser } from 'react-icons/ai';
import { MdLogout } from 'react-icons/md';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import FlightSearch from './components/FlightSearch';
import FlightList from './components/FlightList';
import SeatSelection from './components/SeatSelection';
import Profile from './components/Profile';
import CreateTicket from './components/Createticket';
import image from './assets/logo.png';
import './App.css';
import UserContext, { UserProvider, useUser } from './components/auth/UserContext'; 

const { Header, Content } = Layout;

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <Layout>
          <div style={{ display: 'flex', width: '100%', height: '25px' }}>
            <div style={{ flex: 1, backgroundColor: '#05203c' }}></div>
          </div>
          <Header style={{ background: '#05203c', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={image} alt="Bilet Simgesi" style={{ width: 45, height: 45, marginBottom: '15px', marginLeft: '30px' }} />
                <span style={{ fontSize: '1.4rem', marginRight: '20px', marginBottom: '8px' }}>Biletim Burada</span>
              </div>
              <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} style={{ lineHeight: '64px' }}>
                <Menu.Item key="1" style={{ backgroundColor: '#05203c' }}>
                  <Link to="/search">Arama</Link>
                </Menu.Item>
                <Menu.Item key="2" style={{ backgroundColor: '#05203c' }}>
                  <Link to="/flights">Uçuşlar</Link>
                </Menu.Item>
                
                
              </Menu>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserMenu />
            </div>
          </Header>
          <Content style={{ padding: '50px' }}>
            <Routes>
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<FlightSearch />} />
              <Route path="/flights" element={<FlightList />} />
              <Route path="/seats" element={<SeatSelection />} />
              <Route path="/create-ticket" element={<CreateTicket />} />
              <Route path="/" element={<Navigate to="/search" replace />} />
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </UserProvider>
  );
};

const UserMenu = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/profile" style={{ color: 'white', display: 'flex', alignItems: 'center', marginRight: '20px', cursor: 'pointer' }}>
            <span style={{ marginLeft: '5px' ,fontSize:'20px' }}>{`${user.name} ${user.surname}`}</span>
            <AiOutlineUser style={{ marginLeft: '8px', fontSize: '24px' }} />
          </Link>
          <div onClick={handleLogout} style={{ color: 'white', display: 'flex', alignItems: 'center', marginRight: '20px', cursor: 'pointer' }}>
            <MdLogout style={{ fontSize: '24px' }} />
          </div>
        </div>
      ) : (
        <Link to="/login" style={{ color: 'white', display: 'flex', alignItems: 'center', marginRight: '20px', cursor: 'pointer' }}>
          <span style={{ marginLeft: '5px', fontSize: '20px' }}>Kullanıcı Girişi</span>
          <AiOutlineUser style={{ marginLeft: '8px', fontSize: '24px' }} />
        </Link>
      )}
    </>
  );
};

export default App;
