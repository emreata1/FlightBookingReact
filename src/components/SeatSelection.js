import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import './SeatSelection.css';
import image from '../assets/plane.png';

const rows = ['A', 'B', 'C', '', 'D', 'E', 'F'];
const columns = Array.from({ length: 20 }, (_, index) => index + 1);

export const fetchSeats = async (flightId) => {
  try {
    const response = await fetch(`https://v1.nocodeapi.com/emreatdasdasd/google_sheets/ueHZvTrWGEDySnRG?tabId=seats`);
    const data = await response.json();

    const seatData = data.data;


    const filteredSeats = seatData.filter(seat => seat.FlightID === flightId);

  
    const seatsArray = filteredSeats.map(seat => {
      const seatNumbers = seat.SeatNumber.split(',').map(number => number.trim()).filter(Boolean);
      return seatNumbers.map(seatNumber => ({
        seatNumber: seatNumber,
        booked: seat.Booked === 'TRUE',
        flightId: seat.FlightID
      }));
    });

    const allSeats = [].concat(...seatsArray);


    const flightLayout = rows.map(row => {
      return columns.map(column => {
        if (row === '') return null;

        const seatInfo = allSeats.find(seat => seat.seatNumber === `${column}${row}`);
        return seatInfo ? { ...seatInfo } : { seatNumber: `${column}${row}`, booked: false, flightId: null };
      });
    });


    return flightLayout;
  } catch (error) {
    console.error('Failed to fetch seats:', error);
    return [];
  }
};

export const fetchFlightInfo = async (flightId) => {
  try {
    const response = await fetch(`https://v1.nocodeapi.com/emreatdasdasd/google_sheets/ueHZvTrWGEDySnRG?tabId=flights`);
    const data = await response.json();

    const flightData = data.data;


    const flightInfo = flightData.find(flight => flight.FlightID === flightId);

    return flightInfo;
  } catch (error) {

    return {};
  }
};

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const flightId = params.get('flightId');

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [flightInfo, setFlightInfo] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const flightLayout = await fetchSeats(flightId);

        setSeats(flightLayout);

        const flightDetails = await fetchFlightInfo(flightId);

        setFlightInfo(flightDetails);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [flightId]);

  const handleSeatClick = (seatNumber, isBooked) => {
    if (!isBooked) {
      setSelectedSeat(seatNumber);
    }
  };

  const handleButtonClick = () => {
    if (selectedSeat) {
      navigate(`/create-ticket?flightId=${flightId}&seatNumber=${selectedSeat}`);
    }
  };

  return (
    <div style={{ height: '1000px', display: 'flex' }}>
      <div className="seat-selection-container" style={{ minWidth: '1000px', flex: 1 }}>
        <div className="seat-map" style={{ marginLeft: '170px', marginTop: '153px', fontSize: '15px' }}>
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              {row.map((seat, columnIndex) => (
                seat ? (
                  <div
                    key={columnIndex}
                    className={`seat ${selectedSeat === seat.seatNumber ? 'selected' : ''} ${seat.booked ? 'booked' : ''}`}
                    onClick={() => handleSeatClick(seat.seatNumber, seat.booked)}
                  >
                    {seat.seatNumber}
                  </div>
                ) : (
                  <div key={columnIndex} className="seat empty"></div>
                )
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="info-card" style={{ height: '500px', marginRight: '40px', flex: 0.2, backgroundColor: 'white', padding: '10px', borderRadius: '5px', marginLeft: '10px', boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', marginTop: '10px', textAlign: 'center' }}>Uçuş Bilgileri</h3>
        {flightInfo && (
          <>
            <p><strong>Uçuş Numarası:  </strong>{flightId}</p>
            <p><strong>Kalkış:</strong> {flightInfo.departurecity} ({flightInfo.departure})</p>
            <p><strong>Varış:</strong> {flightInfo.arrivalcity}-({flightInfo.arrival})</p>
            <p><strong>Tarih:</strong> {flightInfo.date}</p>
            <p><strong>Havayolu:</strong> {flightInfo.airline}</p>
            <p><strong>Aktarmalar:</strong> {flightInfo.transfers}</p>
            <p><strong>Kalkış Saati:</strong> {flightInfo.departureTime}</p>
            <p><strong>Süre:</strong> {flightInfo.duration}dk</p>
            <p><strong>Fiyat:</strong> {flightInfo.price}</p>
            <p style={{ height: '5px' }}></p>
            <p style={{ textAlign: 'center' }}><strong>SEÇİLEN KOLTUK</strong></p>
            <p style={{ textAlign: 'center', height: '50px' }}>{selectedSeat}</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button onClick={handleButtonClick}>Seç</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeatSelection;
