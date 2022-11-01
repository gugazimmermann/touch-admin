import axios from "axios";
import axiosErrorHandling from "../../common/axiosErrorHandling";
import { UUID } from "../../common/types";
import { MPClientDataType, MPPaymentPayloadType, MPPaymentResponseType, MPSubscriptionPayloadType, MPSubscriptionResponseType } from "../types";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
const MERCADO_PAGO_ACCESS_TOKEN_TEST = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || "";

const MPURL = 'https://api.mercadopago.com/v1';

const headers = {
  Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN_TEST}`,
  "Content-Type": "application/json",
};

export const clientGet = async (email: string): Promise<MPClientDataType> => {
  const { data } = await axios.get(`${MPURL}/customers/search?email=${email}`, { headers });
  return (data.results && data.results[0] ? data.results[0] : {}) as MPClientDataType;
};

export const clientCreate = async (client: MPClientDataType): Promise<MPClientDataType> => {
  try {
    const { data } = await axios.post(`${MPURL}/customers`, client, { headers });
    return data;
  } catch (error) {
    console.log("client create error", axiosErrorHandling(error));
    return {} as MPClientDataType;
  }
};

export const clientUpdate = async (id: UUID, client: MPClientDataType): Promise<MPClientDataType> => {
  try {
    const { data } = await axios.put(`${MPURL}/customers/${id}`, client, { headers });
    return data;
  } catch (error) {
    console.log("client update error", axiosErrorHandling(error));
    return {} as MPClientDataType;
  }
};

export const paymentCreate = async (paymentPayload: MPPaymentPayloadType): Promise<MPPaymentResponseType> => {
  const { data } = await axios.post(`${MPURL}/payments`, paymentPayload, { headers });
  return data;
};

export const subscriptionCreate = async (subscriptionPayload: MPSubscriptionPayloadType): Promise<MPSubscriptionResponseType> => {
  const { data } = await axios.post(`https://api.mercadopago.com/preapproval`, subscriptionPayload, { headers });
  return data;
};