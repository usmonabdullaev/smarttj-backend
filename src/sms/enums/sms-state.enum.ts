/**
 * Возможные состояния доставки сообщения (MessageState) по спецификации SMSGate API.
 */
export enum SmsMessageState {
  NONE = 'None',
  ENROUTE = 'Enroute',
  DELIVERED = 'Delivered',
  EXPIRED = 'Expired',
  DELETED = 'Deleted',
  UNDELIVERABLE = 'Undeliverable',
  ACCEPTED = 'Accepted',
  UNKNOWN = 'Unknown',
  REJECTED = 'Rejected',
}
