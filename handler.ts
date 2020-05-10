const hash = require('js-sha256');
const aws = require("aws-sdk");
const db = new aws.DynamoDB.DocumentClient({
  region: "us-east-1",
});

export const get = async (event) => {
  const params = {
    TableName: "test-users",
  };
  const result = await db.scan(params).promise();
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify({
      message: result,
      input: event,
    }),
  };
};

export const getID = async (event) => {
  const id = event.path.split("/").filter((temp) => temp)[1];
  const params = {
    TableName: "test-users",
    Key: {
      username: id,
    },
  };
  const result = await db.get(params).promise();
  console.log(result);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: result,
      input: event,
    }),
  };
};

export const post = async (event) => {
  const body = JSON.parse(event.body);
  const user = body.username;
  const pass = body.password;
  const params = {
    TableName: "test-users",
    Item: {
      username: user,
      password: hash.sha256(pass),
    }
  }
  const result = await db.put(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: result,
      input: body,
    }),
  };
};

export const updateID = async (event) => {
  const body = JSON.parse(event.body);
  const id = event.path.split("/").filter((temp) => temp)[1];
  const pass = body.password;
  const params = {
    TableName: "test-users",
    Key: {
      username: id    
    },
    AttributeUpdates: {
      password: {
        Action: "PUT",
        Value: hash.sha256(pass),
      }
    }
  }
  const result = await db.update(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: result,
      input: body,
    }),
  };
};

export const deleteID = async (event) => {
  const id = event.path.split("/").filter((temp) => temp)[1];
  const params = {
    TableName: "test-users",
    Key: {
      username: id,
    },
  };
  const result = await db.delete(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: result,
      input: event,
    }),
  };
};
