const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AWS = require("aws-sdk");
var airbnb = require("airbnbapijs");
const secret = process.env.JWT_SECRET;

const CRYPTO_BYTE_SIZE = process.env.CRYPTO_BYTE_SIZE;

// Function to login user
exports.handler = async event => {
  const { email, password, table } = JSON.parse(event.body);

  const data = await getToken(email, table);

  if ("token" in data) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*" // Required for CORS support to work
      },
      body: JSON.stringify({
        message: "Logged in Successfully",
        token: token.token
      })
    };
  } else {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*" // Required for CORS support to work
      },
      body: JSON.stringify({
        message: "Ooops, we have no record of an account with that email"
      })
    };
  }
};

const getToken = async (email, password) => {
  try {
    var token = await airbnb.newAccessToken({
      email: email,
      password: password
    });

    return token;
  } catch (e) {
    return e;
  }
};
