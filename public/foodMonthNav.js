// Month navigation functionality for the seasonal calendar

// Month mapping for German month abbreviations to full month names
const monthMapping = {
    "JAN": "Januar",
    "FEB": "Februar", 
    "MÄR": "März",
    "MAR": "März",  // Alternative abbreviation
    "MRZ": "März",  // Locale uppercase variant used by toLocaleString
    "APR": "April",
    "MAI": "Mai",
    "JUN": "Juni",
    "JUL": "Juli",
    "AUG": "August",
    "SEP": "September",
    "OKT": "Oktober",
    "NOV": "November",
    "DEZ": "Dezember"
};

// Array of month abbreviations in order
const monthOrder = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];

// Get current month abbreviation
function getCurrentMonth() {
    const date = new Date();
    const month = date.toLocaleString('de-DE', { month: 'short' }).toUpperCase();
    return month;
}

// Get month display name
function getMonthDisplayName(monthAbbr) {
    return monthMapping[monthAbbr] || monthAbbr;
}

// Get previous month
function getPreviousMonth(currentMonthAbbr) {
    const currentIndex = monthOrder.indexOf(currentMonthAbbr);
    if (currentIndex === -1) return currentMonthAbbr;
    
    const previousIndex = currentIndex === 0 ? monthOrder.length - 1 : currentIndex - 1;
    return monthOrder[previousIndex];
}

// Get next month
function getNextMonth(currentMonthAbbr) {
    const currentIndex = monthOrder.indexOf(currentMonthAbbr);
    if (currentIndex === -1) return currentMonthAbbr;
    
    const nextIndex = currentIndex === monthOrder.length - 1 ? 0 : currentIndex + 1;
    return monthOrder[nextIndex];
}

// Calculate year for month navigation
function getYearForMonth(targetMonthAbbr, currentMonthAbbr, currentYear) {
    const targetIndex = monthOrder.indexOf(targetMonthAbbr);
    const currentIndex = monthOrder.indexOf(currentMonthAbbr);
    
    if (targetIndex === -1 || currentIndex === -1) return currentYear;
    
    // If we're in December (11) and target is January (0), increment year
    if (currentIndex === 11 && targetIndex === 0) return currentYear + 1;
    // If we're in January (0) and target is December (11), decrement year
    if (currentIndex === 0 && targetIndex === 11) return currentYear - 1;
    
    return currentYear;
}

// Get available food items for a specific month
function getAvailableInMonth(data, month) {
    const availableInMonth = {
        vegetables: [],
        fruits: [],
        herbs: [],
        salads: []
    };

    for (const category in data.availability) {
        // Make sure the category exists in our result object
        if (!availableInMonth[category]) {
            availableInMonth[category] = [];
        }
        
        for (const item in data.availability[category]) {
            const itemData = data.availability[category][item];
            // Check if the item is available in the given month (either freiland or lager)
            const isAvailable = (itemData.freiland_months && itemData.freiland_months.includes(month)) ||
                               (itemData.lager_months && itemData.lager_months.includes(month));
            
            if (isAvailable) {
                if(category === "vegetables") {
                    availableInMonth[category].push({"name": item, "details": itemData});
                }
                else {
                    availableInMonth[category].push(item);
                }
            }
        }
    }

    return availableInMonth;
}

// Update the UI with new month data
function updateMonthDisplay(monthAbbr, year, foodData) {
    // Update month title
    const monthTitle = document.getElementById('month-title');
    if (monthTitle) {
        monthTitle.textContent = `${getMonthDisplayName(monthAbbr)} ${year}`;
    }

    // Get food data for the month
    const food = getAvailableInMonth(foodData, monthAbbr);

    // Update vegetables list
    const vegetablesList = document.getElementById('vegetables-list');
    if (vegetablesList) {
        vegetablesList.innerHTML = '';
        food.vegetables.forEach(vegetable => {
            const li = document.createElement('li');
            li.className = 'text-gray-700';
            li.textContent = `${vegetable.details.icon} ${vegetable.name}`;
            vegetablesList.appendChild(li);
        });
    }

    // Update fruits list
    const fruitsList = document.getElementById('fruits-list');
    if (fruitsList) {
        fruitsList.innerHTML = '';
        food.fruits.forEach(fruit => {
            const li = document.createElement('li');
            li.className = 'text-gray-700';
            li.textContent = fruit;
            fruitsList.appendChild(li);
        });
    }

    // Update herbs list
    const herbsList = document.getElementById('herbs-list');
    if (herbsList) {
        herbsList.innerHTML = '';
        food.herbs.forEach(herb => {
            const li = document.createElement('li');
            li.className = 'text-gray-700';
            li.textContent = herb;
            herbsList.appendChild(li);
        });
    }

    // Update salads list
    const saladsList = document.getElementById('salads-list');
    if (saladsList) {
        saladsList.innerHTML = '';
        food.salads.forEach(salad => {
            const li = document.createElement('li');
            li.className = 'text-gray-700';
            li.textContent = salad;
            saladsList.appendChild(li);
        });
    }
}

// Initialize the navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the embedded food data
    const foodDataScript = document.getElementById('food-data');
    if (!foodDataScript) {
        console.error('Food data not found');
        return;
    }

    let foodData;
    try {
        const textContent = foodDataScript.textContent || foodDataScript.innerHTML;
        
        if (!textContent || textContent.trim() === '') {
            throw new Error('Food data script element is empty');
        }
        
        foodData = JSON.parse(textContent);
    } catch (error) {
        console.error('Failed to parse food data:', error);
        console.error('Raw content:', foodDataScript.textContent);
        return;
    }

    // State management
    let currentDisplayedMonth = getCurrentMonth();
    let currentDisplayedYear = new Date().getFullYear();

    // Get navigation buttons
    const prevButton = document.getElementById('prev-month');
    const nextButton = document.getElementById('next-month');

    if (!prevButton || !nextButton) {
        console.error('Navigation buttons not found');
        return;
    }

    // Previous month handler
    prevButton.addEventListener('click', function() {
        const previousMonth = getPreviousMonth(currentDisplayedMonth);
        const newYear = getYearForMonth(previousMonth, currentDisplayedMonth, currentDisplayedYear);
        
        currentDisplayedMonth = previousMonth;
        currentDisplayedYear = newYear;
        
        updateMonthDisplay(currentDisplayedMonth, currentDisplayedYear, foodData);
    });

    // Next month handler
    nextButton.addEventListener('click', function() {
        const nextMonth = getNextMonth(currentDisplayedMonth);
        const newYear = getYearForMonth(nextMonth, currentDisplayedMonth, currentDisplayedYear);
        
        currentDisplayedMonth = nextMonth;
        currentDisplayedYear = newYear;
        
        updateMonthDisplay(currentDisplayedMonth, currentDisplayedYear, foodData);
    });

    // Keyboard navigation support
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            prevButton.click();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            nextButton.click();
        }
    });
});
