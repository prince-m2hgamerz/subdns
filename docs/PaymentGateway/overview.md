> ## Documentation Index
> Fetch the complete documentation index at: https://www.cashfree.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Overview

> Browse the v2025-01-01 Cashfree Payment Gateway API reference for orders, payments, refunds, payment links, subscriptions, and base URLs for sandbox and live.

## Payment Gateway endpoints

Use the following base URLs depending on whether you are testing or processing live payments.

| Environment | Base URL                          |
| :---------- | :-------------------------------- |
| Test        | `https://sandbox.cashfree.com/pg` |
| Production  | `https://api.cashfree.com/pg`     |

The latest API version is **2025-01-01** (v5). Previous versions were 2023-08-01, 2022-09-01, 2022-01-01, and 2021-05-21.

## Authentication

All APIs require authentication except `POST /orders/sessions`, which does not require credentials and can be called directly from the browser.

For authentication details for merchants and partners, see [API authentication](/api-reference/authentication).

## Payment gateway APIs

The following sections list all available APIs grouped by function.

### Orders

Use these APIs to create and manage payment orders.

| API                                                                   | Description                                                                                              |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| [Create Order](/api-reference/payments/latest/orders/create)          | Use this API to create orders with Cashfree from your backend and get the payment link.                  |
| [Order Pay](/api-reference/payments/latest/payments/pay)              | Use this API when you have already created the orders and want Cashfree Payments to process the payment. |
| [Preauthorisation](/api-reference/payments/latest/payments/authorize) | Use this API to capture or void a preauthorised payment.                                                 |
| [Get Order](/api-reference/payments/latest/orders/get)                | Use this API to view all details of an order.                                                            |

### Authentication

Use this API to submit or resend an OTP during a payment flow.

| API                                                                          | Description                                                                        |
| :--------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| [Submit or Resend OTP](/api-reference/payments/latest/payments/authenticate) | Use this API to submit or resend an OTP to Cashfree during payment authentication. |

### Payments

Use these APIs to retrieve payment details for an order.

| API                                                                                         | Description                                            |
| :------------------------------------------------------------------------------------------ | :----------------------------------------------------- |
| [Get Payments for an Order](/api-reference/payments/latest/payments/get-payments-for-order) | Use this API to view all payment details for an order. |
| [Get Payment by ID](/api-reference/payments/latest/payments/get)                            | Use this API to view payment details by payment ID.    |

### Settlements

Use these APIs to fetch settlement details for individual orders or across a date range.

| API                                                                                                | Description                                                                                               |
| :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| [Get Settlements by Order ID](/api-reference/payments/latest/operations/get-settlements-for-order) | Use this API to view all settlements for an order.                                                        |
| [Get All Settlements](/api-reference/payments/latest/operations/get-settlements)                   | Use this API to get all settlement details by specifying the settlement ID, settlement UTR or date range. |

### Payment links

Use these APIs to create, retrieve, and manage payment links.

| API                                                                                               | Description                                                                                                                                     |
| :------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| [Create Payment Link](/api-reference/payments/latest/payment-links/create)                        | Use this API to create a new payment link. The URL is returned in the `link_url` parameter of the response.                                     |
| [Fetch Payment Link Details](/api-reference/payments/latest/payment-links/get)                    | Use this API to view all details and status of a payment link.                                                                                  |
| [Get Orders for a Payment Link](/api-reference/payments/latest/payment-links/get-orders-for-link) | Use this API to view all order details for a payment link.                                                                                      |
| [Cancel Payment Link](/api-reference/payments/latest/payment-links/cancel)                        | Use this API to cancel a payment link. No further payments can be done against a cancelled link. Only a link in ACTIVE status can be cancelled. |

### Token vault

Use these APIs to manage saved payment instruments for a customer.

| API                                                                                                     | Description                                                                                                         |
| :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------ |
| [Fetch All Saved Instruments](/api-reference/payments/latest/token-vault/get-all)                       | Use this API to get all saved instruments for a customer ID.                                                        |
| [Fetch Single Saved Instrument](/api-reference/payments/latest/token-vault/get)                         | Use this API to get a specific saved instrument for a customer ID and instrument ID.                                |
| [Delete Saved Instrument](/api-reference/payments/latest/token-vault/delete)                            | Use this API to delete a saved instrument for a customer ID and instrument ID.                                      |
| [Fetch Cryptogram for Saved Instrument](/api-reference/payments/latest/token-vault/generate-cryptogram) | Use this API to get the card network token, token expiry and cryptogram for a saved instrument using instrument ID. |

### Reconciliation

Use these APIs to fetch reconciliation reports for settlements and payment gateway transactions.

| API                                                                                              | Description                                                                                                 |
| :----------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| [Settlement Reconciliation](/api-reference/payments/latest/operations/settlement-reconciliation) | Use this API to get settlement reconciliation details using a settlement ID, settlement UTR, or date range. |
| [PG Reconciliation](/api-reference/payments/latest/operations/reconcile)                         | Use this API to get the payment gateway reconciliation details with date range.                             |