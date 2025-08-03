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