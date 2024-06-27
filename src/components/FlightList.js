import React, { useEffect, useState } from 'react';
import { List, Button, Select, InputNumber } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchFlights } from '../api';
import './FlightList.css';
import { useUser } from './auth/UserContext';
import image from '../assets/pngegg.png';
const { Option } = Select;

const FlightList = () => {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [filters, setFilters] = useState({ transfer: 'all', sortBy: 'price', maxPrice: null, maxDuration: null });
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchFlights = async () => {
      const params = new URLSearchParams(location.search);
      const searchParams = Object.fromEntries(params.entries());

      try {
        const response = await searchFlights(searchParams);

        if (response && Array.isArray(response.data)) {
          setFlights(response.data);
          filterFlights(response.data, searchParams, filters);
        } else {
          console.error('Fetched data is not an array:', response);
        }
      } catch (error) {
        console.error('Failed to fetch flights:', error);
      }
    };
    fetchFlights();
  }, [location.search, filters]);

  useEffect(() => {
    filterFlights(flights, Object.fromEntries(new URLSearchParams(location.search).entries()), filters);
  }, [filters, location.search]);

  const filterFlights = (flights, searchParams, filters) => {
    const filtered = flights.filter(flight => {
      const matchDeparture = !searchParams.departure || (flight.departure && flight.departure.localeCompare(searchParams.departure, 'tr', { sensitivity: 'base' }) === 0);
      const matchArrival = !searchParams.arrival || (flight.arrival && flight.arrival.localeCompare(searchParams.arrival, 'tr', { sensitivity: 'base' }) === 0);
      const matchDate = !searchParams.date || (flight.date && flight.date.split('.').reverse().join('-') === searchParams.date);
      const matchAirline = !searchParams.airline || (flight.airline && flight.airline.localeCompare(searchParams.airline, 'tr', { sensitivity: 'base' }) === 0);

      let matchTransfer = true;
      const flightTransfers = parseInt(flight.transfers, 10);
      if (filters.transfer === 'non-stop') {
        matchTransfer = flightTransfers === 0;
      } else if (filters.transfer === 'one-stop') {
        matchTransfer = flightTransfers === 1;
      } else if (filters.transfer === 'all') {
        matchTransfer = true;
      }

      const matchPrice = filters.maxPrice === null || flight.price <= filters.maxPrice;
      const matchDuration = filters.maxDuration === null || flight.duration <= filters.maxDuration;

      return matchDeparture && matchArrival && matchDate && matchAirline && matchTransfer && matchPrice && matchDuration;
    });

    const sortedFilteredFlights = [...filtered];
    if (filters.sortBy === 'price') {
      sortedFilteredFlights.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'duration') {
      sortedFilteredFlights.sort((a, b) => a.duration - b.duration);
    } else if (filters.sortBy === 'departureTime') {
      sortedFilteredFlights.sort((a, b) => {
        return a.departureTime.localeCompare(b.departureTime, 'en', { hour: 'numeric', minute: 'numeric' });
      });
    }

    setFilteredFlights(sortedFilteredFlights);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value !== undefined ? value : null };
    setFilters(newFilters);
  };

  const handleSelectFlight = (flightId) => {
    navigate(`/seats?flightId=${flightId}`);
  };

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
    <div className="flight-list-container">
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <Select
          defaultValue="all"
          onChange={(value) => handleFilterChange('transfer', value)}
          style={{ marginRight: '10px' }}
        >
          <Option value="all">Tüm Uçuşlar</Option>
          <Option value="non-stop">Aktarmasız</Option>
          <Option value="one-stop">1 Aktarma</Option>
        </Select>
        <Select
          defaultValue="price"
          onChange={(value) => handleFilterChange('sortBy', value)}
          style={{ marginRight: '10px' }}
        >
          <Option value="price">Fiyata Göre</Option>
          <Option value="duration">Süreye Göre</Option>
          <Option value="departureTime">Kalkış Saatine Göre</Option>
        </Select>
        <InputNumber
          placeholder="Max Fiyat"
          value={filters.maxPrice !== null ? filters.maxPrice : ''}
          onChange={(value) => handleFilterChange('maxPrice', value)}
          style={{ marginRight: '10px' }}
          onBlur={() => handleFilterChange('maxPrice', null)}
        />
        <InputNumber
          placeholder="Max Süre"
          value={filters.maxDuration !== null ? filters.maxDuration : ''}
          onChange={(value) => handleFilterChange('maxDuration', value)}
          style={{ marginRight: '10px' }}
          onBlur={() => handleFilterChange('maxDuration', null)}
        />
      </div>
      <div style={{ maxHeight: '570px', overflowY: 'auto' }}>
        <List
          dataSource={filteredFlights}
          renderItem={(flight) => {
            const hours = Math.floor(flight.duration / 60);
            const minutes = flight.duration % 60;
            const formattedDuration = `${hours} saat ${minutes} dakika`;

            return (
              <List.Item
                className="flight-item"
                actions={[
                  <Button onClick={() => handleSelectFlight(flight.FlightID)}>Seç</Button>
                ]}
              >
                <List.Item.Meta
                  style={{ maxWidth: '550px' }}
                  title={
                    <span style={{ fontSize: '17px', fontWeight: 'bold' }}>
                      {`${flight.departurecity} (${flight.departure}) - ${flight.arrivalcity} (${flight.arrival})`}
                    </span>
                  }
                  description={
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                      <span style={{ fontSize: '15px' }}>
                        {`${flight.airline} - ${flight.date}`}
                      </span>
                      <div style={{ marginLeft: '10px', fontSize: '15px' }}>
                        Aktarma: {flight.transfers}
                      </div>
                    </div>
                  }
                />
                <div style={{ marginRight: '200px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{flight.departureTime}</span>
                  <img src={image} style={{ width: 60, height: 10, marginBottom: '10px', marginLeft: '15px', marginRight: '15px' }} />
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{calculateArrivalTime(flight)}</span>
                  <div style={{ textAlign: 'center' }}>{formattedDuration}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ width: '100px', fontSize: '20px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>{flight.price}TL</span>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default FlightList;
