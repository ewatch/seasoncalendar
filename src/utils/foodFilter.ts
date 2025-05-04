export const getAvailableInMonth = function(data: any, month: string) {
    const availableInMonth: any = {
        vegetables: [],
        fruits: [],
        herbs: [],
        salads: []
    };

    for (const category in data.availability) {
        for (const item in data.availability[category]) {
            if (data.availability[category][item].months.includes(month)) {
                if(category === "vegetables") {
                    availableInMonth[category].push({"name": item, "details": data.availability[category][item]});
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