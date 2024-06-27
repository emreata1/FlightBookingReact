import axios from 'axios';

const API_BASE_URL = 'https://v1.nocodeapi.com/emreatdasdasd/google_sheets/ueHZvTrWGEDySnRG?tabId=';

export const searchFlights = async (searchParams) => {
  try {

    const response = await axios.get(`${API_BASE_URL}flights`, { params: searchParams });
    console.log('API Response:', response.data); 
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch flights. Please try again later.');
  }
};

export const getSeats = async (flightId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}seats`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const bookSeat = async (flightId, seatId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}book`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const makePayment = async (paymentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}payment`, paymentData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
