
document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '961b8b071aa2420c5bedd80d2fb638b7';
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const locationEl = document.getElementById('location');
    const dateTimeEl = document.getElementById('date-time');
    const descriptionEl = document.getElementById('description');
    const temperatureEl = document.getElementById('temperature');
    const weatherIconEl = document.getElementById('weather-icon');
    const feelsLikeEl = document.getElementById('feels-like');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const pressureEl = document.getElementById('pressure');
    const forecastGrid = document.getElementById('forecast-grid');

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        }).replace(',', '');
    };

    const displayCurrentWeather = (data) => {
        locationEl.textContent = `${data.name}, ${data.sys.country}`;
        dateTimeEl.textContent = formatDateTime(data.dt);
        descriptionEl.textContent = data.weather[0].description;
        temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
        weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
        humidityEl.textContent = `${data.main.humidity}%`;
        windSpeedEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
        pressureEl.textContent = `${data.main.pressure} hPa`;
    };

    const displayForecast = (data) => {
        forecastGrid.innerHTML = '';
        const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
        dailyData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
            const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
            const temp = Math.round(day.main.temp);
            const description = day.weather[0].main;
            card.innerHTML = `
                <p class="day">${dayName}</p>
                <img src="${iconUrl}" alt="${description}">
                <p class="temp-range">${temp}°C</p>
                <p class="desc">${description}</p>
            `;
            forecastGrid.appendChild(card);
        });
    };
    const getWeatherData = async (city, lat, lon) => {
        const isByCoords = lat && lon;
        const cityParam = isByCoords ? '' : `q=${city}`;
        const coordParam = isByCoords ? `lat=${lat}&lon=${lon}` : '';

        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?${cityParam}${coordParam}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${cityParam}${coordParam}&appid=${apiKey}&units=metric`;

        try {
            const [currentRes, forecastRes] = await Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)]);
            const currentData = await currentRes.json();
            const forecastData = await forecastRes.json();

            if (currentData.cod === 200) {
                displayCurrentWeather(currentData);
            } else {
                alert(currentData.message);
            }

            if (forecastData.cod === "200") {
                displayForecast(forecastData);
            }
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            alert('Failed to fetch weather data. Please try again.');
        }
    };

    const handleSearch = () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city, null, null);
        }
    };

    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    const initialLoad = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    getWeatherData(null, position.coords.latitude, position.coords.longitude);
                },
                () => getWeatherData('Dehradun', null, null)
            );
        } else {
            getWeatherData('Dehradun', null, null);
        }
    };

    initialLoad();
});