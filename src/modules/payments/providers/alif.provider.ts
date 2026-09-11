import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { LoggerService } from '@/logger/logger.service';
import {
  AlifCancelPaymentPayload,
  AlifCancelPaymentResponse,
  AlifCheckStatusPayload,
  AlifCheckStatusResponse,
  AlifGate,
  AlifInitPaymentPayload,
  AlifInitPaymentResponse,
} from '../types/alif.types';

@Injectable()
export class AlifProvider {
  private readonly logger = new LoggerService(AlifProvider.name);

  private readonly apiUrl: string;
  private readonly terminalKey: string;
  private readonly terminalPassword: string;
  private readonly callbackUrl: string;
  private readonly returnUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = (
      this.configService.get<string>('ALIF_API_URL') ||
      'https://test-web.alif.tj'
    ).replace(/\/$/, '');
    this.terminalKey =
      this.configService.get<string>('ALIF_TERMINAL_KEY') || '';
    this.terminalPassword =
      this.configService.get<string>('ALIF_TERMINAL_PASSWORD') || '';
    this.callbackUrl =
      this.configService.get<string>('ALIF_CALLBACK_URL') || '';
    this.returnUrl = this.configService.get<string>('ALIF_RETURN_URL') || '';
  }

  /**
   * Генерация HMAC SHA256 подписи в соответствии со спецификацией Alif:
   * 1. Предварительное хеширование пароля: derivedKey = HMAC_SHA256(terminal_password, terminal_key)
   * 2. Итоговый токен: token = HMAC_SHA256(derivedKey, dataToSign)
   */
  generateToken(dataToSign: string): string {
    const derivedKey = crypto
      .createHmac('sha256', this.terminalPassword)
      .update(this.terminalKey)
      .digest('hex');

    return crypto
      .createHmac('sha256', derivedKey)
      .update(dataToSign)
      .digest('hex')
      .toLowerCase();
  }

  /**
   * Прямой HMAC SHA256 (на случай альтернативного формата авторизации в Alif)
   */
  generateDirectToken(dataToSign: string): string {
    return crypto
      .createHmac('sha256', this.terminalPassword)
      .update(dataToSign)
      .digest('hex')
      .toLowerCase();
  }

  /**
   * Проверка подписи входящего callback или ответа
   */
  verifyResponseToken(
    receivedToken: string,
    orderId: string,
    status: string,
    transactionId: string | number,
  ): boolean {
    if (!receivedToken) return false;

    const dataToSign = `${orderId}${status}${transactionId}`;
    const tokenDerived = this.generateToken(dataToSign);
    const tokenDirect = this.generateDirectToken(dataToSign);

    const receivedNormalized = receivedToken.toLowerCase().trim();
    return (
      receivedNormalized === tokenDerived || receivedNormalized === tokenDirect
    );
  }

  /**
   * Инициализация платежа (POST /v2/)
   */
  async initPayment(params: {
    orderId: string;
    amount: number;
    returnUrl?: string;
    info?: string;
    email?: string;
    phone?: string;
    gate?: AlifGate;
  }): Promise<AlifInitPaymentResponse> {
    const formattedAmount = params.amount.toFixed(2);
    const effectiveCallbackUrl = this.callbackUrl;
    const effectiveReturnUrl = params.returnUrl || this.returnUrl;
    const effectiveInfo =
      params.info || `Оплата заказа №${params.orderId} в SmartTJ`;

    // dataToSign = key + order_id + amount + callback_url
    const dataToSign = `${this.terminalKey}${params.orderId}${formattedAmount}${effectiveCallbackUrl}`;
    const token = this.generateToken(dataToSign);

    const payload: AlifInitPaymentPayload = {
      order_id: params.orderId,
      key: this.terminalKey,
      token,
      callback_url: effectiveCallbackUrl,
      return_url: effectiveReturnUrl,
      amount: formattedAmount,
      info: effectiveInfo,
    };

    if (params.email) payload.email = params.email;
    if (params.phone) payload.phone = params.phone;
    if (params.gate) payload.gate = params.gate;

    this.logger.log(`Initiating Alif payment for order ${params.orderId}`, {
      apiUrl: this.apiUrl,
      key: this.terminalKey,
      orderId: params.orderId,
      amount: formattedAmount,
    });

    try {
      const response = await fetch(`${this.apiUrl}/v2/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(params.gate ? { gate: params.gate } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AlifInitPaymentResponse;

      if (!response.ok || data.code !== 200) {
        this.logger.error('Alif initPayment rejected', {
          httpStatus: response.status,
          responseData: data,
        });
      }

      return data;
    } catch (error: any) {
      this.logger.error('Failed to request Alif initPayment', { error });

      throw error;
    }
  }

  /**
   * Проверка статуса транзакции (POST /checktxn)
   */
  async checkTransaction(orderId: string): Promise<AlifCheckStatusResponse> {
    // dataToSign = key + orderId
    const dataToSign = `${this.terminalKey}${orderId}`;
    const token = this.generateToken(dataToSign);

    const payload: AlifCheckStatusPayload = {
      orderId,
      key: this.terminalKey,
      token,
    };

    try {
      const response = await fetch(`${this.apiUrl}/checktxn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AlifCheckStatusResponse;
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to check transaction for order ${orderId}`, {
        error: error?.message || error,
      });
      throw error;
    }
  }

  /**
   * Отмена платежа (POST /cancel/standard)
   */
  async cancelPayment(params: {
    transactionId: string;
    amount: number;
    reason?: string;
  }): Promise<AlifCancelPaymentResponse> {
    const formattedAmount = params.amount.toFixed(2);
    // dataToSign = key + transaction_id + amount
    const dataToSign = `${this.terminalKey}${params.transactionId}${formattedAmount}`;
    const token = this.generateToken(dataToSign);

    const payload: AlifCancelPaymentPayload = {
      key: this.terminalKey,
      transaction_id: params.transactionId,
      token,
      amount: formattedAmount,
      reason: params.reason,
    };

    try {
      const response = await fetch(`${this.apiUrl}/cancel/standard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AlifCancelPaymentResponse;
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to cancel payment ${params.transactionId}`, {
        error: error?.message || error,
      });
      throw error;
    }
  }
}
