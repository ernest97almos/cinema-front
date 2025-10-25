import { useEffect, useState } from 'react';
import './App.css';

// Твой бекенд URL
const API_URL = 'https://cinema-ifslutv.onrender.com/api';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingData, setBookingData] = useState({
    email: '',
    seat_number: ''  // Использую seat_number как в твоём изначальном запросе
  });

  // 1. GET /movies - получить все фильмы
  useEffect(() => {
    fetch(`${API_URL}/movies/`)
      .then(response => response.json())
      .then(data => setMovies(data))
      .catch(error => console.error('Error:', error));
  }, []);

  // 2. GET /bookings/{movie_id} - получить брони по ID фильма
  const fetchBookings = (movieId) => {
    fetch(`${API_URL}/bookings/${movieId}`)
      .then(response => response.json())
      .then(data => {
        setBookings(data);
        setSelectedMovie(movieId);
      })
      .catch(error => console.error('Error:', error));
  };

  // 3. POST /bookings/ - создать бронь
  const createBooking = (e) => {
    e.preventDefault();
    if (!selectedMovie) return alert('Сначала выберите фильм');

    const bookingPayload = {
      movie_id: selectedMovie,
      seat_id: parseInt(bookingData.seat_number),  // seat_id как в твоей схеме
      email: bookingData.email
    };

    fetch(`${API_URL}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingPayload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Booking failed');
      return response.json();
    })
    .then(data => {
      alert('Место успешно забронировано!');
      setBookingData({ email: '', seat_number: '' });
      // Обновляем список броней
      fetchBookings(selectedMovie);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Ошибка бронирования: ' + error.message);
    });
  };

  return (
    <div className="app">
      <h1>🎬 Cinema Booking System</h1>
      
      {/* Секция 1: Список фильмов */}
      <div className="section">
        <h2>Доступные фильмы</h2>
        <div className="movies-list">
          {movies.map(movie => (
            <div 
              key={movie.id} 
              className={`movie-card ${selectedMovie === movie.id ? 'selected' : ''}`}
              onClick={() => fetchBookings(movie.id)}
            >
              <h3>{movie.title}</h3>
              <p>Жанр: {movie.genre}</p>
              <p>Длительность: {movie.duration}</p>
              <p>Рейтинг: {movie.imdb_rating}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Секция 2: Форма бронирования */}
      <div className="section">
        <h2>Бронирование места</h2>
        <form onSubmit={createBooking} className="booking-form">
          <input
            type="email"
            placeholder="Ваш email"
            value={bookingData.email}
            onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Номер места"
            value={bookingData.seat_number}
            onChange={(e) => setBookingData({...bookingData, seat_number: e.target.value})}
            required
            min="1"
          />
          <button type="submit" disabled={!selectedMovie}>
            Забронировать
          </button>
        </form>
        {!selectedMovie && <p className="hint">↑ Выберите фильм из списка выше</p>}
      </div>

      {/* Секция 3: Список броней */}
      <div className="section">
        <h2>Забронированные места {selectedMovie && `для фильма ID: ${selectedMovie}`}</h2>
        {bookings.length > 0 ? (
          <div className="bookings-grid">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <p><strong>Место:</strong> {booking.seat_id}</p>
                <p><strong>Email:</strong> {booking.email}</p>
                <p><strong>Дата:</strong> {new Date(booking.booking_date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Нет забронированных мест</p>
        )}
      </div>
    </div>
  );
}