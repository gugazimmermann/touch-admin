import axios from "axios";
import axiosErrorHandling from "../../common/axiosErrorHandling";
import { MPPaymentPayloadType, MPPaymentResponseType, MPSubscriptionPayloadType, MPSubscriptionResponseType } from "../types";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
const MERCADO_PAGO_ACCESS_TOKEN_TEST = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || "";

const MPURL = 'https://api.mercadopago.com/v1';

const headers = {
  Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN_TEST}`,
  "Content-Type": "application/json",
};

export const paymentCreate = async (paymentPayload: MPPaymentPayloadType): Promise<MPPaymentResponseType> => {
  try {
    const { data } = await axios.post(`${MPURL}/payments`, paymentPayload, { headers });
    return data;
  } catch (error) {
    console.log("payment create error", axiosErrorHandling(error));
    return {} as MPPaymentResponseType;
  }
};

export const subscriptionCreate = async (subscriptionPayload: MPSubscriptionPayloadType): Promise<MPSubscriptionResponseType> => {
  try {
    const { data } = await axios.post(`https://api.mercadopago.com/preapproval`, subscriptionPayload, { headers });
    return data;
  } catch (error) {
    console.log("subscription create error", axiosErrorHandling(error));
    return {} as MPSubscriptionResponseType;
  }
};