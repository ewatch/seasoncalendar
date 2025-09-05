export const getAvailableInMonth = function(data: any, month: string) {
    const availableInMonth: any = {
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

// Mapping for German month abbreviations to full month names
const monthMapping: { [key: string]: string } = {
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

/*
The function will return the month as german three letter 
capital abbreviation with one of the following values depending on the current month:
["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"]
*/
export const getCurrentMonth = function() {
    const date = new Date();
    const month = date.toLocaleString('de-DE', { month: 'short' }).toUpperCase();
    return month;
}

/*
Returns the full German month name for display purposes
*/
export const getCurrentMonthDisplayName = function() {
    const monthAbbr = getCurrentMonth();
    return monthMapping[monthAbbr] || monthAbbr;
}

/*
Converts a month abbreviation to its full German name
*/
export const getMonthDisplayName = function(monthAbbr: string) {
    return monthMapping[monthAbbr] || monthAbbr;
}

// Array of month abbreviations in order
const monthOrder = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];

/*
Gets the previous month abbreviation
*/
export const getPreviousMonth = function(currentMonthAbbr: string) {
    const currentIndex = monthOrder.indexOf(currentMonthAbbr);
    if (currentIndex === -1) return currentMonthAbbr; // Invalid month, return as is
    
    const previousIndex = currentIndex === 0 ? monthOrder.length - 1 : currentIndex - 1;
    return monthOrder[previousIndex];
}

/*
Gets the next month abbreviation
*/
export const getNextMonth = function(currentMonthAbbr: string) {
    const currentIndex = monthOrder.indexOf(currentMonthAbbr);
    if (currentIndex === -1) return currentMonthAbbr; // Invalid month, return as is
    
    const nextIndex = currentIndex === monthOrder.length - 1 ? 0 : currentIndex + 1;
    return monthOrder[nextIndex];
}

/*
Calculates the year for a given month relative to the current month
This is useful for navigation to maintain the correct year when crossing year boundaries
*/
export const getYearForMonth = function(targetMonthAbbr: string, currentMonthAbbr: string, currentYear: number) {
    const targetIndex = monthOrder.indexOf(targetMonthAbbr);
    const currentIndex = monthOrder.indexOf(currentMonthAbbr);
    
    if (targetIndex === -1 || currentIndex === -1) return currentYear;
    
    // If we're in December (11) and target is January (0), increment year
    if (currentIndex === 11 && targetIndex === 0) return currentYear + 1;
    // If we're in January (0) and target is December (11), decrement year
    if (currentIndex === 0 && targetIndex === 11) return currentYear - 1;
    
    return currentYear;
}