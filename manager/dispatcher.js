const airbnb = require('airbnbapijs');
const AWS = require('aws-sdk');
const apiKey = process.env.apiKey;
const client = require('twilio')(process.env.accountsSid, process.env.authToken);
var checksoutToday = [];


/* Cron job that runs twice a day, it fetches all available crew members
   then fetches all your properties which have guests checking out that day,
   then crew members are notified about the properties in order to provide maintenance
*/
exports.handler = async (event, context) => {

    try {

        const token = await getToken();

        airbnb.setConfig({
            defaultToken: token,
            apiKey: apiKey
        })

        const crewMembers = await getCrew()


        var data = await airbnb.getOwnActiveListings(token);
        var date = await getToday();

        //TODO find better way to send batch sms, maybe swtich to AWS SNS
        data.array.forEach(async element => {

            var currentListing = airbnb.getCalendar({
                token: token,
                id: element.id,
                startDate: date,
                endDate: date
            })

            if (currentListing.checkout == date)
                checksoutToday.push(currentListing.address) //TODO verify if address is correct field
        });


        crewMembers.array.forEach(async employee => {
            await sendPing(employee.name, employee.number)
        })



        return success;
    } catch (err) {
        console.log(err);
        return failure;
    }

}



const sendPing = async (name, number) => {

    try {
        let msg = await client.messages.create({
            body: `Hello, ${name}, hope all is well, these properties are ready for maintenance: ${JSON.stringify(checksoutToday).replace(/[\[\]']+/g, '').replace(/,/g, ', ')} (please let Jonny know if you are willing to work on a property)`
            from: process.env.myNumber,
            to: number
        })

        console.log(msg)
    } catch (err) {
        console.log(err)
    }


}


// Function gets all online/available crew members
const getCrew = async () => {
    var params = {
        TableName: 'CrewMembers',
        ExpressionAttributeValues: {
            ':s': true
        }
        FilterExpression: 'Online = :s'
    }

    var documentClient = new AWS.DynamoDB.DocumentClient();

    return documentClient.scan(params).promise();

}


const getToday = async () => {

    var date = new Date();

    return date.getFullYear() + "-" + date.getMonth() + " " + date.getDay();

}

// Function to get host's login token
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