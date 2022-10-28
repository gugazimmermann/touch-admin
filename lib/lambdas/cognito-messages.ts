import * as dotenv from 'dotenv';
import { CustomMessageResponse } from './common/types';

dotenv.config();

const ADMIN_URL = process.env.ADMIN_URL || '';
const PROJECT_NAME = process.env.PROJECT_NAME || '';

const sendCodePostSignUp = (email: string, code: string): CustomMessageResponse => {
  return {
    emailSubject: `${PROJECT_NAME} - Código de verificação`,
    emailMessage: `<p>Olá, obrigado por se cadastrar!</p>
    <br />
    <p>Seu código de verificação é: <strong>${code}</strong></p>
    <p>Digite seu código no campo informado ou <strong><a href="${ADMIN_URL}confirmar-cadastro?email=${email}&code=${code}">clique aqui</a></strong>.</p>
  `,
  };
}

const sendCodeForgotPassword = (email: string, code: string): CustomMessageResponse => {
  return {
    emailSubject: `${PROJECT_NAME} - Recuperar Senha`,
    emailMessage: `<p>Olá,</p>
  <br />
  <p>Seu código de recuperação de senha é:  <strong>${code}</strong></p>
  <p>Digite seu código no campo informado ou clique aqui: <strong><a href="${ADMIN_URL}redefinir-senha?email=${email}&code=${code}">clique aqui</a></strong>.</p>
  `,
  };
}

const sendCodeVerifyNewEmail = (code: string): CustomMessageResponse => {
  return {
    emailSubject: `${PROJECT_NAME} - Validação de Email`,
    emailMessage: `<p>Olá,</p>
  <br />
  <p>Seu código de validação de senha é: <strong>${code}</strong></p>
`,
  };
}

const resendConfirmationCode = (email: string, code: string): CustomMessageResponse => {
  return {
    emailSubject: `${PROJECT_NAME} - Código de verificação`,
    emailMessage: `<p>Olá, obrigado por se cadastrar!</p>
    <br />
    <p>Seu novo código verificação é: <strong>${code}</strong></p>
    <p>Digite seu código no campo informado ou <strong><a href="${ADMIN_URL}confirmar-cadastro?email=${email}&code=${code}">clique aqui</a></strong>.</p>
  `,
  };
}

const messages = {
  sendCodePostSignUp,
  sendCodeForgotPassword,
  sendCodeVerifyNewEmail,
  resendConfirmationCode
}

export default messages;
