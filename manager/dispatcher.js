const airbnb = require('airbnbapijs');
const AWS = require('aws-sdk')

const apiKey = process.env.apiKey


exports.handler = async (event, context) => {

    const token = await getToken();

    airbnb.setConfig({
        defaultToken: token,
        apiKey: apiKey
    })

    try {

        var data = await airbnb.getOwnActiveListings(token);
        
        data.array.forEach(async element => {

            var date = await getToday();
            var currentListing = airbnb.getCalendar({
                token: token,
                id: element.id,
                startDate: date,
                endDate: date
            })

            if (currentListing.checkout == date) {

                sendPing()
            }
        });

        return success;
    } catch (err) {
        console.log(err);
        return failure;
    }

}



const sendPing = async () => {




}



const getToday = async () => {

    var date = new Date();

    return date.getFullYear() + "-" + date.getMonth() + " " + date.getDay();
    
}


const getToken = async () => {
    try {
        var token = await airbnb.newAccessToken({
            username: process.env.email,
            password: process.env.password
        });

        return token.token;
    } catch (e) {
        return e;
    }
};