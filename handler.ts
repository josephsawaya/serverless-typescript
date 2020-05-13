import { isMainThread } from "worker_threads";

const hash = require('js-sha256');
const aws = require("aws-sdk");
const db = new aws.DynamoDB.DocumentClient({
  region: "us-east-1",
});

const ses = new aws.SES();


export const get = async (event) => {
  const params = {
    TableName: "UsersTable",
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
    TableName: "UsersTable",
    Key: {
      username: id,
    },
  };
  const result = await db.get(params).promise();
  console.log(result);
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

export const post = async (event) => {
  const body = JSON.parse(event.body);
  const user = body.username;
  const pass = body.password;
  const params = {
    TableName: "UsersTable",
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
    TableName: "UsersTable",
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
    TableName: "UsersTable",
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

export const sendEmail = async (event) => {
  const { to, from, subject, text } = JSON.parse(event.body);
  const params = {
    Destination: {
      ToAddresses: [ to ] 
    },
    Message: {
      Body: {
        Text: { Data: text }
      },
      Subject: {
        Data: subject
      }
    },
    Source: from
  }
  await ses.sendEmail(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: {
        to,
        from,
        subject,
        text
      },
      input: event,
    }),
  }
}

export const createEmail = async (event) => {
  const { name, subject, text, html } = JSON.parse(event.body);
  const params = {
    Template: {
      TemplateName: name,
      SubjectPart: subject,
      TextPart: text,
      HtmlPart: html
    }
  }
  // try {
    await ses.createTemplate(params).promise();
  // }catch(err){
  //   console.log(err);
  // }
  

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: params,
      input: event,
    }),
  }
}

export const sendTemplatedEmail = async (event) => {
  const { from, name, to, data, config } = JSON.parse(event.body);
  const params = {
    Source: from,
    Template: name,
    Destination: {
      ToAddresses: [ to ]
    },
    TemplateData: data,
    ConfigurationSetName: config
  };

  await ses.sendTemplatedEmail(params).promise();
  console.log(
    "made it",
    params
  )
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: JSON.parse(event.body)
    }) 
  };
}