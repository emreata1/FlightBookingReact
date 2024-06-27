import React, { useState, useContext } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { UserContext } from './UserContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://v1.nocodeapi.com/emreatdasdasd/google_sheets/ueHZvTrWGEDySnRG?tabId=data`
      );

      const serverData = response.data.data;

      const user = serverData.find(
        (user) => user["email"] === values.email && user["password"] === values.password
      );

      if (user) {
        setUser(user);
        message.success('Giriş başarılı!');
        navigate('/search');
      } else {
        message.error('Giriş başarısız! Kullanıcı adı veya şifre hatalı.');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Giriş başarısız!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '1000px', marginTop: '25px' }}>
      <div className="form-container">
        <span style={{ fontSize: '2rem', marginLeft: '3px', color: 'black', display: 'block', marginBottom: '20px' }}>
          Giriş Yap
        </span>
        <Form onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Lütfen e-posta girin!' }]}
          >
            <Input placeholder="E-posta" className='form-item' />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Lütfen şifre girin!' }]}
          >
            <Input.Password placeholder="Şifre" className='form-item' />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Giriş Yap
            </Button>
          </Form.Item>
          <Form.Item style={{ justifyContent: 'center', textAlign: 'center' }}>
            <span>Hala üye değil misin? </span>
            <Link to="/register">Kayıt Ol</Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
