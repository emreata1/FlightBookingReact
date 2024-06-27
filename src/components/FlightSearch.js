import React, { useState, useEffect } from 'react';
import { Form, Select, Row, Col, Button, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FlightSearch.css';
import locale from 'antd/es/date-picker/locale/tr_TR';
import '../index.css'
const { Option } = Select;

const FlightSearch = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);

  useEffect(() => {
    axios.get('/assets/airports.json')
      .then(response => {
        setAirports(response.data);
      })
      .catch(error => {
        console.error("Havalimanı verileri çekilirken bir hata oluştu:", error);
      });
  }, []);

  const onFinish = (values) => {
    const formattedValues = {
      ...values,
      date: values.date ? values.date.format('YYYY-MM-DD') : undefined
    };

    console.log('Formatted Values:', formattedValues);

    navigate({
      pathname: '/flights',
      search: new URLSearchParams(formattedValues).toString(),
    });
  };

  return (
    <div>
      <div className="search-form" style={{marginLeft:'150px',background: '#05203c', maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>
        <span style={{ fontSize: '3rem', marginLeft: '3px', color: 'white', display: 'block', marginBottom: '40px' }}>
          Binlerce uçuş. Hepsi bir arada.
        </span>
        <Form form={form} onFinish={onFinish}>
          <Row gutter={10} justify="center" align="middle">
            <Col xs={24} sm={12} md={5}>
              <Form.Item
                name="departure"
                rules={[{ required: true, message: 'Kalkış yeri seçin!' }]}
              >
                <Select
                  showSearch
                  placeholder="Kalkış Yeri"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%', height: '75px', fontSize: '16px' }}
                  className="custom-select-4"
                >
                  {airports.map((airport) => (
                    <Option key={airport.value} value={airport.value}>{airport.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Form.Item
                name="arrival"
                rules={[{ required: true, message: 'Varış yeri seçin!' }]}
              >
                <Select
                  showSearch
                  placeholder="Varış Yeri"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%', height: '75px', fontSize: '16px' }}
                  className="custom-select-2"
              >
                {airports.map((airport) => (
                  <Option key={airport.value} value={airport.value}>{airport.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Form.Item
              name="date"
              rules={[{ required: true, message: 'Tarih seçin!' }]}
            >
              <DatePicker style={{ width: '100%', height: '75px', fontSize: '16px' }} className="custom-select-3" locale={locale} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Form.Item name="airline">
              <Select
                placeholder="Havayolu Şirketi"
                style={{ width: '100%', height: '75px', fontSize: '16px' }}
                className="custom-select-1"
              >
                <Option value="Ajet">AJET</Option>
                <Option value="Pegasus">Pegasus</Option>
                <Option value="THY">Türk Hava Yolları</Option>
                <Option value="SunExpress">SunExpress</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '50%', height: '75px', borderRadius: '15px', fontSize: '18px' }}>Ara</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

    </div>
    
    </div>
  );
};

export default FlightSearch;
