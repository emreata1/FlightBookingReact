import React, { useState, useEffect } from 'react';
import { Card, Avatar, List } from 'antd';
import { useUser } from './auth/UserContext';
import image from '../assets/pngegg.png';

const Profile = () => {
  const { user } = useUser();
  const [flightDetails, setFlightDetails] = useState([]);

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await fetch('https://v1.nocodeapi.com/emreatdasdasd/google_sheets/ueHZvTrWGEDySnRG?tabId=flights');
        const data = await response.json();
        
        const filteredFlights = data.data.filter(flight => user.flightsID.includes(flight.FlightID.toString()));
        
        setFlightDetails(filteredFlights);
      } catch (error) {
        console.error('Error fetching flight details:', error);
      }
    };

    fetchFlightDetails();
  }, [user.flightsID]);

  const calculateArrivalTime = (flight) => {
    const departureTimeParts = flight.departureTime.split('.');
    const departureHour = parseInt(departureTimeParts[0], 10);
    const departureMinute = parseInt(departureTimeParts[1], 10);

    const durationHours = Math.floor(flight.duration / 60);
    const durationMinutes = flight.duration % 60;

    let arrivalHour = departureHour + durationHours;
    let arrivalMinute = departureMinute + durationMinutes;

    if (arrivalMinute >= 60) {
      arrivalHour += Math.floor(arrivalMinute / 60);
      arrivalMinute %= 60;
    }

    arrivalHour %= 24;

    return `${arrivalHour.toString().padStart(2, '0')}:${arrivalMinute.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '100vh', paddingTop: '25px', gap: '20px' }}>
      <Card style={{ width: 300, height: 570 }}>
        <Card.Meta
          avatar={<Avatar src="https://via.placeholder.com/128" />}
          title={`${user.name} ${user.surname}`}
          description={user.email}
        />
        <div style={{ height: '425px', marginTop:'30px' }}>
          <p><strong>İsim:</strong> {user.name}</p>
          <p><strong>Soyisim:</strong> {user.surname}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Cinsiyet:</strong> {user.gender}</p>
          <p><strong>Doğum Tarihi:</strong> {user.birthdate}</p>
          <p><strong>Güncel Uçuşlar:</strong> {user.flightsID}</p>
        </div>
      </Card>

      <Card style={{ width: 700, height: 570 }}>
        <Card.Meta
          title={<strong>Uçuş Detayları</strong>}
          style={{ marginBottom: '10px' }}
        />
        <List
          dataSource={flightDetails}
          renderItem={(flight) => (
            <List.Item key={flight.FlightID} style={{ marginBottom: '20px' }}>
              <List.Item.Meta
                title={
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {`${flight.departurecity} (${flight.departure}) - ${flight.arrivalcity} (${flight.arrival})`}
                  </span>
                }
                description={
                  <span style={{ fontSize: '16px' }}>
                    {`${flight.airline} - ${flight.date}`}
                  </span>
                }
              />
              <List.Item.Meta
                title={
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {`${flight.departureTime} - ${calculateArrivalTime(flight)}`}
                  </span>
                }
                description={
                  <span style={{ fontSize: '10px', marginLeft: '28px' }}><strong>Aktarma:</strong> {flight.transfers}</span>
                }
              />
              <div style={{marginBottom: '20px', display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{flight.price}TL</span>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Profile;
