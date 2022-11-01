import { UUID } from "./types";

export interface IMercadoPagoClientData {
  address?: {
    id?: string;
    zip_code?: string;
    street_name?: string;
    street_number?: number;
    city?: string;
  };
  addresses?: string[];
  cards?: string[];
  date_created?: string;
  date_last_updated?: string;
  date_registered?: string;
  default_address?: string;
  default_card?: string;
  description?: string;
  email?: string;
  first_name?: string;
  id?: string;
  identification?: {
    type?: string;
    number?: string;
  };
  last_name?: string;
  live_mode?: string;
  metadata?: {
    source_sync?: string;
  };
  phone?: {
    area_code?: string;
    number?: string;
  };
}

export interface IMercadoPagoClient {
  clientID: string;
  profileID: string;
  cient: IMercadoPagoClientData;
}

type PaymentMethodsPayerCostsType = {
  installment_rate: number;
  discount_rate: number;
  min_allowed_amount: number;
  labels: any[];
  installments: number;
  reimbursement_rate: any;
  max_allowed_amount: number;
  payment_method_option_id: string;
};

type PaymentMethodsIssuerType = {
  installment_rate: number;
  discount_rate: number;
  min_allowed_amount: number;
  labels: any[];
  installments: number;
  reimbursement_rate: any;
  max_allowed_amount: number;
  payment_method_option_id: string;
};

type PaymentMethodsSettingsSecurityCodeType = {
  mode: string;
  card_location: string;
  length: number;
};

type PaymentMethodsSettingsCardNumberType = {
  length: number;
  validation: string;
};

type PaymentMethodsSettingsBinType = {
  pattern: string;
  installments_pattern: string;
  exclusion_pattern: string;
};

type PaymentMethodsSettingsType = {
  security_code: PaymentMethodsSettingsSecurityCodeType;
  card_number: PaymentMethodsSettingsCardNumberType;
  bin: PaymentMethodsSettingsBinType;
};

type PaymentMethodsResultsType = {
  financial_institutions: any[];
  secure_thumbnail: string;
  payer_costs: PaymentMethodsPayerCostsType[];
  issuer: PaymentMethodsIssuerType;
  total_financial_cost: boolean;
  min_accreditation_days: number;
  max_accreditation_days: number;
  merchant_account_id: any;
  id: string;
  payment_type_id: string;
  accreditation_time: number;
  thumbnail: string;
  bins: any[];
  marketplace: string;
  deferred_capture: string;
  agreements: any[];
  labels: string[];
  financing_deals: PaymentMethodsFinancingDealsType;
  name: string;
  site_id: string;
  processing_mode: string;
  additional_info_needed: string[];
  status: string;
  settings: PaymentMethodsSettingsType[];
};

type PaymentMethodsFinancingDealsType = {
  legals: any;
  installments: any;
  expiration_date: any;
  start_date: any;
  status: string;
};

type PaymentIssuerType = {
  id: string;
  name: string;
  secure_thumbnail: string;
  thumbnail: string;
  processing_mode: string;
  merchant_account_id: null;
  status: string;
};

type PaymentInstallmentPayerCostsType = {
  installments: number;
  installment_rate: number;
  discount_rate: number;
  reimbursement_rate: any;
  labels: string[];
  installment_rate_collector: string[];
  min_allowed_amount: number;
  max_allowed_amount: number;
  recommended_message: string;
  installment_amount: number;
  total_amount: number;
  payment_method_option_id: string;
};

export type PaymentFormType = {
  cardholderName?: string;
  documentType?: string;
  document?: string;
  cardNumber?: string;
  cardExpiration?: string;
  securityCode?: string;
  paymentOption?: string;
  paymentMethod?: PaymentMethodsResultsType;
  issuer?: PaymentIssuerType;
  installmentOptions?: PaymentInstallmentPayerCostsType[];
};

type PaymentCardTokenCardholderIdentificationType = {
  number: string;
  type: string;
};

type PaymentCardTokenCardholderType = {
  identification: PaymentCardTokenCardholderIdentificationType;
  name: string;
};

export type PaymentCardTokenType = {
  id: string;
  public_key: string;
  first_six_digits: string;
  expiration_month: number;
  expiration_year: number;
  last_four_digits: string;
  cardholder: PaymentCardTokenCardholderType;
  status: string;
  date_created: string;
  date_last_updated: string;
  date_due: string;
  luhn_validation: boolean;
  live_mode: boolean;
  require_esc: boolean;
  card_number_length: number;
  security_code_length: number;
};

export interface PaymentDataType extends PaymentFormType {
  profileID: UUID;
  eventID: UUID;
  installments: number;
  issuer_id: string;
  identification: {
    type: string;
    number: string;
  };
  payment_method_id: string;
  token: string;
}

export type PaymentData = {
  additional_info: {
    items: [
      {
        id: string;
        title: string;
        description: string;
        category_id: string;
        quantity: number;
        unit_price: number;
      }
    ];
    payer: {
      first_name: string;
      last_name: string;
      phone: {
        area_code: string;
        number: string;
      };
      address: {
        zip_code: string;
        street_name: string;
      };
    };
  };
  description: string;
  installments: number;
  issuer_id: string;
  payer: {
    id: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
    first_name: string;
    last_name: string;
  };
  payment_method_id: string;
  statement_descriptor: string;
  token: string;
  transaction_amount: number;
};

export type PaymentRes = {
  id: number;
  date_created: string;
  date_approved: string;
  date_last_updated: string;
  date_of_expiration: any;
  money_release_date: string;
  money_release_status: any;
  operation_type: string;
  issuer_id: string;
  payment_method_id: string;
  payment_type_id: string;
  status: string;
  status_detail: string;
  currency_id: string;
  description: string;
  live_mode: boolean;
  sponsor_id: any;
  authorization_code: any;
  money_release_schema: any;
  taxes_amount: number;
  counter_currency: any;
  brand_id: any;
  shipping_amount: number;
  build_version: string;
  pos_id: any;
  store_id: any;
  integrator_id: any;
  platform_id: any;
  corporation_id: any;
  collector_id: number;
  payer: {
    first_name: any;
    last_name: any;
    email: string;
    identification: {
      number: string;
      type: string;
    };
    phone: {
      area_code: any;
      number: any;
      extension: any;
    };
    type: any;
    entity_type: any;
    id: any;
  };
  marketplace_owner: any;
  metadata: any;
  additional_info: {
    items: [
      {
        id: string;
        title: string;
        description: string;
        picture_url: any;
        category_id: string;
        quantity: string;
        unit_price: string;
      }
    ];
    payer: {
      phone: {
        area_code: string;
        number: string;
      };
      address: {
        zip_code: string;
        street_name: string;
      };
      first_name: string;
      last_name: string;
    };
    available_balance: any;
    nsu_processadora: any;
    authentication_code: any;
  };
  order: any;
  external_reference: any;
  transaction_amount: number;
  transaction_amount_refunded: number;
  coupon_amount: number;
  differential_pricing_id: any;
  deduction_schema: any;
  installments: number;
  transaction_details: {
    payment_method_reference_id: any;
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    external_resource_url: any;
    installment_amount: number;
    financial_institution: any;
    payable_deferral_period: any;
    acquirer_reference: any;
  };
  fee_details: [
    {
      type: string;
      fee_payer: string;
      amount: number;
    },
    {
      type: string;
      amount: number;
      fee_payer: string;
    }
  ];
  charges_details: [];
  captured: boolean;
  binary_mode: boolean;
  call_for_authorize_id: any;
  statement_descriptor: string;
  card: {
    id: any;
    first_six_digits: string;
    last_four_digits: string;
    expiration_month: number;
    expiration_year: number;
    date_created: string;
    date_last_updated: string;
    cardholder: {
      name: string;
      identification: {
        number: string;
        type: string;
      };
    };
  };
  notification_url: any;
  refunds: any[];
  processing_mode: string;
  merchant_account_id: any;
  merchant_number: any;
  acquirer_reconciliation: any[];
  point_of_interaction: {
    type: string;
    business_info: {
      unit: string;
      sub_unit: string;
    };
  };
};

export type SubscriptionData = {
  reason: string;
  external_reference: string;
  payer_email: string;
  card_token_id: string;
  auto_recurring: {
    frequency: number;
    frequency_type: "days" | "months";
    transaction_amount: number;
    currency_id: "ARS" | "BRL" | "CLP" | "MXN" | "COP" | "PEN" | "UYU";
  };
  back_url: string;
  status: "authorized";
};

export type SubscriptionRes = {
  id: string;
  version: number;
  application_id: number;
  collector_id: number;
  preapproval_plan_id: string;
  reason: string;
  external_reference: number;
  back_url: string;
  init_point: string;
  auto_recurring: {
    frequency: 1;
    frequency_type: string;
    start_date: string;
    end_date: string;
    currency_id: string;
    transaction_amount: 10;
    free_trial: {
      frequency: 1;
      frequency_type: string;
    };
  };
  payer_id: number;
  card_id: number;
  payment_method_id: number;
  next_payment_date: string;
  date_created: string;
  last_modified: string;
  status: string;
};
