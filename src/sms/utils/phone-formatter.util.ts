export class PhoneFormatter {
  /**
   * Приводит телефонный номер к международному формату Таджикистана:
   * 992XXXXXXXXX (12 цифр без символа + и разделителей).
   */
  static normalize(phone: string): string {
    if (!phone) {
      return '';
    }

    // Удаляем все нецифровые символы (+, пробелы, скобки, тире)
    const digits = phone.replace(/\D/g, '');

    // Если номер начинается с 992 и содержит 12 цифр
    if (digits.startsWith('992') && digits.length === 12) {
      return digits;
    }

    // Если передан 9-значный локальный номер (например, 900123456)
    if (digits.length === 9) {
      return `992${digits}`;
    }

    // Если передан номер вида 8900123456 (10 цифр с 8 в начале)
    if (digits.startsWith('8') && digits.length === 10) {
      return `992${digits.slice(1)}`;
    }

    // Если номер уже длиннее или имеет префикс, пробуем отрезать до последних 9 цифр после 992
    const match = digits.match(/(?:992)?(\d{9})$/);
    if (match) {
      return `992${match[1]}`;
    }

    return digits;
  }

  /**
   * Проверяет, является ли номер валидным форматом Таджикистана (992 + 9 цифр).
   */
  static isValid(phone: string): boolean {
    const normalized = this.normalize(phone);
    return /^992\d{9}$/.test(normalized);
  }

  /**
   * Маскирует номер для безопасного вывода в логах (например: 992*****3456).
   */
  static mask(phone: string): string {
    const normalized = this.normalize(phone);
    if (normalized.length === 12) {
      return `${normalized.slice(0, 3)}*****${normalized.slice(-4)}`;
    }
    return phone.length > 4
      ? `${phone.slice(0, 3)}***${phone.slice(-2)}`
      : '***';
  }
}
