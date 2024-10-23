import React, { useEffect, useState } from 'react';

// Define the structure of the holiday object
interface Holiday {
    name: string;
    date: {
        iso: string;
    };
}

// Mapping holiday names to icons
const holidayIcons: { [key: string]: string } = {
    "Christmas Day": "🎄",                // Christmas tree icon
    "Halloween": "🎃",                    // Jack-o'-lantern icon
    "Thanksgiving Day": "🦃",             // Turkey icon
    "New Year's Day": "🎉",               // Party popper icon
    "Valentine's Day": "❤️",              // Heart icon
    "Independence Day": "🇺🇸",            // US flag icon
    "Martin Luther King Jr. Day": "✊",   // Raised fist icon
    "Memorial Day": "🏵️",                // Rosette icon
};

// Mapping months to a representative holiday name and icon
const holidaysByMonth: { [key: number]: { name: string; icon: string } } = {
    1: { name: "New Year's Day", icon: holidayIcons["New Year's Day"] },           // January
    2: { name: "Valentine's Day", icon: holidayIcons["Valentine's Day"] },         // February
    3: { name: "Martin Luther King Jr. Day", icon: holidayIcons["Martin Luther King Jr. Day"] }, // March
    4: { name: "Rain", icon: "🌧️" },                         // April
    5: { name: "Memorial Day", icon: holidayIcons["Memorial Day"] },                 // May
    6: { name: "Sun", icon: "☀️" },                            // June
    7: { name: "Fireworks", icon: "🎆" },                     // July
    8: { name: "Swimming", icon: "🏊" },                       // August
    9: { name: "Apple", icon: "🍏" },                          // September
    10: { name: "Halloween", icon: holidayIcons["Halloween"] }, // October
    11: { name: "Thanksgiving Day", icon: holidayIcons["Thanksgiving Day"] }, // November
    12: { name: "Christmas Day", icon: holidayIcons["Christmas Day"] }, // December
};

const Holidays: React.FC = () => {
    const [currentIcon, setCurrentIcon] = useState<string | null>(null); // Store the icon to display
    const currentMonth = new Date().getMonth() + 1; // Get the current month (1-12)

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await fetch(`https://calendarific.com/api/v2/holidays?api_key=CMUYEkm7VaaPlBqvRKXmppwSyO3GC7aa&country=US&year=2024`);
                const data = await response.json();

                // Ensure we are working with the correct type
                const holidaysList: Holiday[] = data.response.holidays;

                // Get the representative holiday for the current month
                const holidayThisMonth = holidaysByMonth[currentMonth];

                if (holidayThisMonth && holidayThisMonth.icon) {
                    setCurrentIcon(holidayThisMonth.icon);
                } else {
                    setCurrentIcon(null); // No holiday this month
                }
            } catch (error) {
                console.error('Error fetching holidays:', error);
                setCurrentIcon(null); // Default to no icon if error
            }
        };

        fetchHolidays();
    }, [currentMonth]);

    return (
        //commented out stuff is for testing that all icons work properly
        <div>
            {/* <h1>Current Holiday Icon:</h1> */}
            {currentIcon && (
                <div style={{ fontSize: '48px' }}>
                    {currentIcon}
                </div>
            )}
            {/* <h2>Holiday Icons for Each Month:</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {Object.entries(holidaysByMonth).map(([month, holiday]) => (
                    <div key={month} style={{ margin: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px' }}>{holiday.icon}</div>
                        <div>{holiday.name}</div>
                    </div>
                ))}
            </div> */}
        </div>
    );
};

export default Holidays;
