import React, { useState } from 'react';
import { Form, Input, Button, message, DatePicker, Select, Row, Col } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';
import moment from 'moment';
import 'moment/locale/tr'; 
import locale from 'antd/es/date-picker/locale/tr_TR';
const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getNewUserId = async () => {
    try {
      const response = await axios.get("https://v1.nocodeapi.com/emreatdasdasd/google_sheets/ueHZvTrWGEDySnRG?tabId=data");
      const rows = response.data.data;
      return rows.length + 1; 
    } catch (err) {
      console.error(err);
      message.error('Kullanıcı ID alınamadı');
      return null;
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const newUserId = await getNewUserId();
      if (newUserId === null) {
        throw new Error('Yeni kullanıcı ID alınamadı');
      }

      const userId = newUserId + 1;
      console.log(`Yeni kullanıcı ID'si: ${userId}`);

      const birthDateFormatted = values.birthDate ? moment(values.birthDate).format('DD.MM.YYYY') : '';
      const response = await axios.post("https://v1.nocodeapi.com/emreatdasdasd/google_sheets/ueHZvTrWGEDySnRG?tabId=data",
        [[values.email, values.password, values.name, values.surname, values.gender, birthDateFormatted, values.tcno,userId]],
        { headers: { "Content-Type": "application/json" }}
      );
      console.log(response.data); 

      message.success('Kayıt Başarılı');
      navigate("/login"); 
    } catch (err) {
      console.error(err);
      message.error('Kayıt Başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '1000px', marginTop: '25px' }}>
      <div className="form-container">
        <span style={{ fontSize: '2rem', marginLeft: '3px', color: 'black', display: 'block', marginBottom: '20px' }}>
          Kayıt Ol
        </span>
        <Form onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" rules={[{ required: true, message: 'Lütfen ad girin!' }]}>
                <Input placeholder="Ad" className='form-item' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="surname" rules={[{ required: true, message: 'Lütfen soyad girin!' }]}>
                <Input placeholder="Soyad" className='form-item' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender">
                <Select placeholder="Cinsiyet" className='form-item' >
                  <Option value="Kadın">Kadın</Option>
                  <Option value="Erkek">Erkek</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="birthDate" rules={[{ required: true, message: 'Tarih seçin!' }]}>
                <DatePicker className='form-item' locale={locale} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" rules={[{ required: true, message: 'Lütfen e-posta girin!' }]}>
                <Input placeholder="E-posta" className='form-item' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tcno" rules={[{ required: true, message: 'Lütfen kimlik numarası girin!' }]}>
                <Input placeholder="T.C Kimlik Numarası" className='form-item' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="password" rules={[{ required: true, message: 'Lütfen şifre girin!' }]}>
                <Input.Password placeholder="Şifre" className='form-item' />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>Kayıt Ol</Button>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ justifyContent: 'center', textAlign: 'center' }}>
            <span>Zaten üye misin? </span>
            <Link to="/login">Giriş Yap</Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
