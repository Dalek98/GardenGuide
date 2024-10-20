const apiKey = 'YOUR_API_KEY';  // Replace with your WeatherAPI key
const location = 'Tauranga';
const forecastDays = 7;
const weatherStatus = document.getElementById('weatherStatus');
const waterAdvice = document.getElementById('waterAdvice');
const weeklySchedule = document.getElementById('weeklySchedule');

// Fetch weather data
async function getWeatherData() {
    const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=${forecastDays}`);
    const data = await response.json();
    return data;
}

// Calculate watering needs
function calculateWateringSchedule(weatherData) {
    let schedule = [];
    weatherData.forecast.forecastday.forEach(day => {
        const rainChance = day.day.daily_chance_of_rain;
        const avgTemp = day.day.avgtemp_c;
        const date = day.date;

        if (rainChance < 50 && avgTemp > 20) {
            schedule.push(date);
        }
    });
    return schedule;
}

// Update UI
async function updateWateringSchedule() {
    try {
        const weatherData = await getWeatherData();
        weatherStatus.textContent = `Weather in ${location}`;
        const schedule = calculateWateringSchedule(weatherData);

        if (schedule.length > 0) {
            waterAdvice.textContent = "This week you should water on:";
            schedule.forEach(day => {
                const li = document.createElement('li');
                li.textContent = day;
                weeklySchedule.appendChild(li);
            });
        } else {
            waterAdvice.textContent = "No need to water this week!";
        }
    } catch (error) {
        weatherStatus.textContent = "Failed to load weather data.";
        console.error(error);
    }
}

updateWateringSchedule();

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch(error => console.log('Service Worker Registration Failed:', error));
}

// Notification function
function notifyUser(day) {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.getRegistration().then(reg => {
            reg.showNotification(`Time to water the garden on ${day}!`);
        });
    } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                notifyUser(day);
            }
        });
    }
}
