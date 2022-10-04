import { Callback, Context } from 'aws-lambda';
import messages from "./cognito-messages";

interface Event {
  triggerSource: string;
  request: {
    codeParameter: string;
    userAttributes: {
      'cognito:user_status': string;
      email: string;
    };
    usernameParameter: string;
  };
  response: {
    emailSubject: string;
    emailMessage: string;
  };
}

export const handler = async (event: Event, _context: Context, callback: Callback) => {
  const { triggerSource, request: { codeParameter, userAttributes } } = event;

  if (triggerSource === 'CustomMessage_SignUp' && userAttributes['cognito:user_status'] === 'UNCONFIRMED') {
    event.response = messages.sendCodePostSignUp(userAttributes.email, codeParameter);
  } else if (triggerSource === 'CustomMessage_ForgotPassword') {
    event.response = messages.sendCodeForgotPassword(userAttributes.email, codeParameter);
  } else if (triggerSource === 'CustomMessage_UpdateUserAttribute') {
    event.response = messages.sendCodeVerifyNewEmail(codeParameter);
  } else if (triggerSource === 'CustomMessage_ResendCode') {
    event.response = messages.resendConfirmationCode(userAttributes.email, codeParameter);
  }

  // Return to Amazon Cognito
  callback(null, event);
}
