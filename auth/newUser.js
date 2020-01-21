'use strict'
const AWS = require('aws-sdk');


AWS.config.update({ region: "us-east-1" });

//Function to register new user
exports.handler = async(event, context) => {

    try {
        await createUser(event)

        return success;
    }
    catch (err) {
        console.log(err)
        return failure;
    }
}

const success = {
    statusCode: 200,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
        message: 'Success'
    })
}

const failure = {
    statusCode: 400,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
        message: 'Oops, something went wrong, please, try again'
    })
}


const createUser = async (event) => {

    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

    const { email, firstName, lastName, phoneNumber, password } = JSON.parse(event.body);

    const { salt, hash } = await computeHash(password);


    const params = {
        TableName: "Volunteers",
        Item: {
            firstName: firstName,
            email: email,
            lastName: lastName,
            phoneNumber: phoneNumber,
            passwordHash: hash,
            passwordSalt: salt

        }
    }

    return documentClient.put(params).promise();


}


const computeHash = (password) => {
    const iterations = 4096
    const salt = crypto.randomBytes(CRYPTO_BYTE_SIZE).toString('base64')
    const token = crypto.randomBytes(CRYPTO_BYTE_SIZE).toString('base64')
  
    const hash = crypto.pbkdf2Sync(password, salt, iterations, CRYPTO_BYTE_SIZE, 'sha512').toString('base64')
    return new Promise((resolve, reject) => {
      resolve({ hash, salt, token })
    })
  }
