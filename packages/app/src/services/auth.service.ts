import { CognitoUser, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'YOUR_USER_POOL_ID', // Your user pool id here
  ClientId: 'YOUR_CLIENT_ID', // Your client id here
};

const userPool = new CognitoUserPool(poolData);

export const signUp = (email, password, phone_number) => {
  const attributeList = [];
  const dataEmail = {
    Name: 'email',
    Value: email,
  };
  const dataPhoneNumber = {
    Name: 'phone_number',
    Value: phone_number,
  };
  attributeList.push(dataEmail);
  attributeList.push(dataPhoneNumber);

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result.user);
    });
  });
};

export const signIn = (email, password) => {
  const authenticationData = {
    Username: email,
    Password: password,
  };
  const authenticationDetails = new AuthenticationDetails(authenticationData);
  const userData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};
