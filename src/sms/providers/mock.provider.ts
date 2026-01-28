export class MockSmsProvider {
  send(phone: string, message: string) {
    console.log(`SMS to ${phone}: ${message}`);
  }
}
