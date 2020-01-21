const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const AWS = require('aws-sdk');

const secret = process.env.JWT_SECRET

const CRYPTO_BYTE_SIZE = process.env.CRYPTO_BYTE_SIZE

//Function to login user
exports.handler = async (event) => {
    
    const { email, password, table } = JSON.parse(event.body)

    const data = await getUser(email, table)
       
   if ("Item" in data) {
            
        const hash = await computeHash(password, data.Item.passWordSalt);
        const passwordHashBuffer = data.Item.passwordHash;

        console.log(passwordHashBuffer)
      
        if (passwordHashBuffer === hash) {

           // TODO: encode user info into token instead of sending 2 seperate objects
            const token = jwt.sign({ email }, secret, { expiresIn: '7 days' })
            
            // Deletes passwordhash and salt for security reasons
            delete data.passwordHash; 
            delete data.passWordSalt;

            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*' // Required for CORS support to work
                },
                body: JSON.stringify({
                    message: 'success logged in',
                    token: token,
                  
                    user: data.Item
                })
            }

        } else {
            return {
                statusCode: 401,
                headers: {
                    'Access-Control-Allow-Origin': '*' // Required for CORS support to work
                },
                body: JSON.stringify({
                    message: 'Ooops, it appears the email or password you\'ve entered is incorrect'
                })
            }
        }

    }
    else {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*' // Required for CORS support to work
            },
            body: JSON.stringify({
                message: 'Ooops, we have no record of an account with that email'
            })
        }
    }
}


const computeHash = (password, salt) => {
    const iterations = 4096
    const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('base64')
    return new Promise((resolve, reject) => {
        resolve(hash)
    })
}


const getUser = (email, table) => {

    const dynamoDB = new AWS.DynamoDB.DocumentClient()

    const params = {
        TableName: table,
        Key: {   
            email: email
        }
    }

    return dynamoDB.get(params).promise()
}

