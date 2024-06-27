import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form, Input, message, Card, Row, Col, Select, DatePicker, Modal , Checkbox } from 'antd';
import './Createticket.css';
import emailjs from '@emailjs/browser';
import axios from 'axios';
const api_url="https://v1.nocodeapi.com/emreatdasdasd/google_sheets/ueHZvTrWGEDySnRG?tabId="
// const fetchUserByTcno = async (tcno) => {
//   try {
    

//     console.log('User found:', user);
//     return user;
//   } catch (error) {
//     console.error('Failed to fetch user by TC No:', error);
//     throw error;
//   }
// };


export const fetchSeats = async (flightId) => {
  try {
    const response = await fetch(`${api_url}seats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    const data = responseData.data;
    const availableSeats = [];
    data.forEach(UserData => {
      if (UserData.FlightID === flightId) {
        availableSeats.push(UserData);
      }
    });
    return availableSeats;
  } catch (error) {
    console.error('Failed to fetch or update seats:', error);
    throw error;
  }
};

const updateSeatStatus = async (flightId, newSeatNumber, tcno) => {
  try {

    const response2 = await fetch(`${api_url}data`);
    const data2 = await response2.json();
    const user2 = data2.data.find(item => item.tcno === tcno); 
    console.log(user2); 
    if (!user2) {
      throw new Error(`TC No'su ${tcno} olan kullanıcı bulunamadı.`);
    }


    let availableSeats = await fetchSeats(flightId);
    if (!availableSeats.some(seat => seat.SeatNumber === newSeatNumber)) {
      availableSeats.push({ SeatNumber: newSeatNumber });
    }


    const requestBody = {
      row_id: flightId,
      SeatNumber: availableSeats.map(seat => seat.SeatNumber).join(','),
      Booked: "TRUE",
    };
    const response = await fetch(
      `${api_url}seats`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );
    const data = await response.json();

    const requestBody1 = {
      row_id: user2.userid,
      flightsID: flightId
    };
    const response1 = await fetch(
      `${api_url}data`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody1)
      }
    );

    console.log(tcno);
    console.log(`Koltuk ${newSeatNumber} başarıyla güncellendi.`);
    return data;
  } catch (error) {
    console.error('Koltuk durumu güncelleme hatası:', error);
    throw error;
  }
};





const createTicket = async (ticketData) => {
  try {
    const response = await axios.post(
      "https://v1.nocodeapi.com/emreatdasdasd/google_sheets/ueHZvTrWGEDySnRG?tabId=tickets",
      [[ticketData.name, ticketData.surname, ticketData.email, ticketData.tcno, ticketData.gender, ticketData.birthdate, ticketData.phone, ticketData.flightId, ticketData.seatNumber, ticketData.pnr,ticketData.canChange]],
      { headers: { "Content-Type": "application/json" }}
    );

    return response.data;
  } catch (error) {
    console.error('Bilet oluşturma sırasında hata:', error);
    throw error;
  }
};

const fetchFlightInfo = async (flightId) => {
  try {
    const response = await fetch(`${api_url}flights`);
    const data = await response.json();
    const flightData = data.data;
    const flightInfo = flightData.find(flight => flight.FlightID === flightId);
    return flightInfo;
  } catch (error) {
    console.error('Failed to fetch flight info:', error);
    return {};
  }
};

const generatePNR = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const CreateTicket = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const params = new URLSearchParams(location.search);
  const flightId = params.get('flightId');
  const seatNumber = params.get('seatNumber');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [flightInfo, setFlightInfo] = useState({});
  const [ticketPreview, setTicketPreview] = useState({});
  const [cardPreview, setCardPreview] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pnr, setPnr] = useState('');
  const [isTicketCreated, setIsTicketCreated] = useState(false);
  const [canChange, setCanChange] = useState(false);

  const price = parseFloat(flightInfo.price); 
const additionalCharge = canChange ? 50 : 0; 
const totalPrice = price + additionalCharge; 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const flightDetails = await fetchFlightInfo(flightId);
        setFlightInfo(flightDetails);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [flightId]);

  const handleFormChange = async (changedValues, allValues) => {
    setTicketPreview({
      ...allValues,
      flightId,
      seatNumber,
      pnr,
    });
  };
  

  const handleCardChange = (changedValues, allValues) => {
    setCardPreview(allValues);
  };
  
  const handleSubmit = async (values) => {
    setLoading(true);
    const pnr = generatePNR();
    setPnr(pnr);
    const ticketData = {
      ...values,
      flightId,
      seatNumber,
      pnr,
    };
  
    try {
      message.success('Bilet başarıyla oluşturuldu! Biletiniz e-posta adresinize gönderilmiştir.');
  
      form.resetFields();
      setTicketPreview({
        ...values,
        flightId,
        seatNumber,
        pnr,
      });
      setIsTicketCreated(true);
      setIsModalVisible(false);
      await updateSeatStatus(flightId, seatNumber, values.tcno);
    } catch (error) {
      console.error('Error during ticket creation:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  
  const showModal = async () => {
    await form.submit();
    setTicketPreview({
      ...form.getFieldsValue(),
      flightId,
      seatNumber,
      pnr,
      
    });
    setPnr(generatePNR());
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const formValues = form.getFieldsValue();
    setLoading(true);
    const pnr = generatePNR();
    setPnr(pnr);
    
    try {
    
      const ticketData = {
        name: formValues.name,
        surname: formValues.surname,
        email: formValues.email,
        tcno: formValues.tcno,
        gender: formValues.gender,
        birthdate: formValues.birthdate,
        phone: formValues.phone,
        flightId,
        seatNumber,
        pnr,
        price: flightInfo.price,
        canChange: canChange
      };

      if (canChange) {
        flightInfo.price += 50; 
      }
      await createTicket(ticketData);
      sendEmail();
      message.success('Bilet başarıyla oluşturuldu! Biletiniz e-posta adresinize gönderilmiştir.');
      createTicket(flightId,seatNumber,pnr);
      fetchSeats(flightId);
      await updateSeatStatus(flightId, seatNumber, ticketPreview.tcno);
      setIsModalVisible(false);
  
      setIsTicketCreated(true);
  
      form.resetFields();
      setTicketPreview({
        ...form.getFieldsValue(),
        flightId,
        seatNumber,
        pnr,
      });

      
    } catch (error) {
      console.error('Error during ticket creation:', error);

    } finally {
      setLoading(false);
    }
  };
  
  

  const handleTicketCreatedModalClose = () => {
    setCardPreview({});
    setTicketPreview({});
    form.resetFields();
    setIsTicketCreated(false);
    navigate('/');
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const form1 = useRef();

  const sendEmail = (e) => {
    if (e) e.preventDefault();

    emailjs
      .sendForm('service_yabpxsm', 'template_n1lk0uc', form1.current, 'z8Uxzj9jq3iS-CEHe')
      .then(
        () => {
          // console.log('SUCCESS!');
        },
        (error) => {
          // console.log('FAILED...', error.text);
        },
      );
  };

  return (
    <div className="ticket-container">
      <div className="preview-container">
        <Card className="ticket-card">
          <div style={{ marginTop: '20px', marginLeft: '100px' }}>
            <p style={{ display: 'inline-block', width: '132px' }}>{`${ticketPreview.name || 'XXXXX'} ${ticketPreview.surname || 'XXXXX'}`}</p>
            <p style={{ display: 'inline-block', width: '145px' }}>{flightId || 'XXXX'}</p>
            <p style={{ display: 'inline-block', width: '155px' }}>{flightInfo.departureTime || 'XXXX'}</p>
            <p style={{ display: 'inline-block' }}>{ticketPreview.name || 'XXXXX'}</p>
          </div>
          <div style={{ marginTop: '20px', marginLeft: '145px' }}>
            <p style={{ display: 'inline-block', width: '155px' }}>{flightInfo.departurecity || 'XXXX'}</p>
            <p style={{ display: 'inline-block', width: '237px' }}>{flightInfo.arrivalcity || 'XXXX'}</p>
            <p style={{ display: 'inline-block' }}>{flightId || 'XXXX'}</p>
          </div>
          <div style={{ marginTop: '10px', marginLeft: '170px' }}>
            <p style={{ display: 'inline-block', width: '210px' }}>{seatNumber || 'XXXX'}</p>
            <p style={{ display: 'inline-block', width: '155px' }}>{flightInfo.departureTime || 'XXXX'}</p>
            <p style={{ display: 'inline-block' }}>{flightInfo.departurecity || 'XXXX'}</p>
          </div>
          <div style={{ textAlign: 'right', marginRight: '50px', marginTop: '-3px' }}>
            <p style={{ display: 'inline-block' }}>{flightInfo.arrivalcity || 'XXXX'}</p>
          </div>
          <div style={{ textAlign: 'left',marginLeft:'225px',marginTop: '-20px' }}>
            <p style={{ display: 'inline-block' }}>{ticketPreview.phone || 'XXXX'}</p>
          </div>
        </Card>

        <Form form={form} onValuesChange={handleFormChange} onFinish={handleSubmit} style={{ marginTop: '13px' }}>
          <Card style={{height:'350px'}} className="card-info">
            <div style={{ textAlign: 'left', marginTop: '-15px', marginBottom: '-10px' }}>
              <h1>Yolcu Bilgileri</h1>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" rules={[{ required: true, message: 'Lütfen ad girin!' }]}>
                  <Input placeholder="Ad" style={{ height: '50px' }} className='form-item' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="surname" rules={[{ required: true, message: 'Lütfen soyad girin!' }]}>
                  <Input placeholder="Soyad" style={{ height: '50px' }} className='form-item' />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="email" rules={[{ required: true, message: 'Lütfen e-posta girin!' }]}>
                  <Input placeholder="E-posta" style={{ height: '50px' }} className='form-item' />
                </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item name="tcno" rules={[{ required: true, message: 'Lütfen TC Kimlik Numarası girin!' }]}>
  <Input placeholder="TC No" style={{ height: '50px' }} className='form-item' />
</Form.Item>

              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="gender" rules={[{ required: true, message: 'Lütfen cinsiyet seçin!' }]}>
                  <Select placeholder="Cinsiyet" style={{ width: '100%', height: '50px' }}>
                    <Select.Option value="male">Erkek</Select.Option>
                    <Select.Option value="female">Kadın</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="birthdate" rules={[{ required: true, message: 'Lütfen doğum tarihi girin!' }]}>
                  <DatePicker
                    style={{ width: '100%', height: '50px' }}
                    placeholder="Doğum Tarihi Seçiniz"
                    format="DD.MM.YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone" rules={[{ required: true, message: 'Lütfen telefon numarası girin!' }]}>
                  <Input placeholder="Telefon Numarası" style={{ height: '50px' }} className='form-item' />
                </Form.Item>
              </Col>
              <Form.Item>
              <Checkbox checked={canChange} onChange={(e) => setCanChange(e.target.checked)}>Bilet değişim hakkı istiyorum(+50TL)</Checkbox>
            </Form.Item>
            </Row>
          </Card>
        </Form>
      </div>
      <div className="preview-container">
        <Card className="ticket-card1">
          <div>
            <p style={{ textAlign: 'right', marginTop: '5px', marginRight: '17px', color: 'white' }}>{cardPreview.cvv || 'XXX'}</p>
            <p style={{ marginTop: '70px', marginLeft: '15px', height: '25px', fontSize: '20px', color: 'white' }}>{cardPreview.cardNumber || 'XXXX-XXXX-XXXX-XXXX'}</p>
            <div style={{ display: 'flex', justifyContent: 'left', marginTop: '60px', marginLeft: '10px' }}>
              <p style={{ width: '113px', color: 'white' }}>{cardPreview.cardName || 'XXXX XXXX'}</p>
              <div style={{ width: '50px' }}></div>
              <p style={{ color: 'white' }}>{cardPreview.expiryDate || 'AA/YY'}</p>
            </div>
          </div>
        </Card>
        <Card className="card-info" style={{ height: '350px', width: '410px', marginTop: '15px' }}>
          <Form form={form} onValuesChange={handleCardChange}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="cardName" rules={[{ required: true, message: 'Lütfen kart üzerindeki ismi girin!' }]}>
                  <Input placeholder="Kart Üzerindeki İsim" className='form-item' style={{height:'50px'}} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="cardNumber" rules={[{ required: true, message: 'Lütfen kart numarasını girin!' }]}>
                  <Input placeholder="Kart Numarası" className='form-item' style={{height:'50px'}} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="expiryDate" rules={[{ required: true, message: 'Lütfen son kullanma tarihini girin!' }]}>
                  <Input placeholder="Son Kullanma Tarihi (MM/YY)" className='form-item' style={{height:'50px'}} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="cvv" rules={[{ required: true, message: 'Lütfen CVV numarasını girin!' }]}>
                  <Input placeholder="CVV" className='form-item' style={{height:'50px'}} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item>
                  <Button type="primary" onClick={showModal} loading={loading} style={{ width: '100%', height: 'auto', padding: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '25px' }}>{`${totalPrice} TL`}</span>

                    <span style={{ marginTop: '-10px' }}>Ödeme</span>
                  </Button>
                  <Modal
                    title="Ödeme Onayı"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    width={800}
                    footer={[
                      <Button key="cancel" onClick={handleCancel}>
                        İptal
                      </Button>,
                      <Button key="ok" type="primary" onClick={handleOk} loading={loading}>
                        Onayla
                      </Button>,
                    ]}
                  >
                    <p>Biletinizi oluşturmak ve ödeme yapmak üzeresiniz. Onaylıyor musunuz?</p>

                    <form ref={form1} onSubmit={sendEmail} style={{display:'none'}}>
                      <label>Ad</label>
                      <input type="text" name="user_name" value={ticketPreview.name}/>
                      <label>Soyad</label>
                      <input type="text" name="user_surname" value={ticketPreview.surname} readOnly />
                      <label>E-posta</label>
                      <input type="email" name="user_email" value={ticketPreview.email}/>
                      <label>TC Kimlik Numarası</label>
                      <input type="text" name="user_tcno" value={ticketPreview.tcno} readOnly />
                      <label>PNR Numarası</label>
                      <input type="text" name="ticket_pnr" value={pnr} readOnly />
                      <label>Uçuş ID</label>
                      <input type="text" name="flightId" value={flightId} readOnly />
                      <label>Koltuk Numarası</label>
                      <input type="text" name="user_seatNumber" value={seatNumber} readOnly />
                      <label>Uçuş Bilgileri</label>
                      <input type="text" name="flightInfo" value={`${flightInfo.departurecity}(${flightInfo.departure}) - ${flightInfo.arrivalcity}(${flightInfo.arrival}) (${flightInfo.departureTime})`} readOnly />
                      <label>Toplam Fiyat</label>
                      <input type="text" name="ticket_price" value={`${totalPrice}`} readOnly />
                      <input type="submit" value="Gönder" />
                    </form>
                  </Modal>
                </Form.Item>
              </Col>
            </Row>han
          </Form>
        </Card>
      </div>
      <Modal
        title="Biletiniz başarıyla oluşturuldu!"
        visible={isTicketCreated}
        onCancel={handleTicketCreatedModalClose}
        footer={[
          <Button key="ok" type="primary" onClick={handleTicketCreatedModalClose}>
            Tamam
          </Button>
        ]}
      >
        <p style={{marginTop:'20px'}}>PNR Numaranız: {pnr}</p>
        <p>E-posta Adresiniz: {ticketPreview.email}</p>
      </Modal>
    </div>
  );
};
export default CreateTicket;