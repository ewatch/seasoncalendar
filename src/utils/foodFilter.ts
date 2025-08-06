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