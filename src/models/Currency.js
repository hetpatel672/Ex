export class Currency {
  constructor({
    code = 'USD',
    name = 'US Dollar',
    symbol = '$',
    exchangeRate = 1.0,
    isDefault = false,
    position = 'before', // 'before' or 'after'
    decimalPlaces = 2
  }) {
    this.code = code;
    this.name = name;
    this.symbol = symbol;
    this.exchangeRate = parseFloat(exchangeRate);
    this.isDefault = isDefault;
    this.position = position;
    this.decimalPlaces = decimalPlaces;
  }

  toJSON() {
    return {
      code: this.code,
      name: this.name,
      symbol: this.symbol,
      exchangeRate: this.exchangeRate,
      isDefault: this.isDefault,
      position: this.position,
      decimalPlaces: this.decimalPlaces
    };
  }

  static fromJSON(json) {
    return new Currency(json);
  }

  formatAmount(amount) {
    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: this.decimalPlaces,
      maximumFractionDigits: this.decimalPlaces
    });

    return this.position === 'before' 
      ? `${this.symbol}${formattedAmount}`
      : `${formattedAmount}${this.symbol}`;
  }

  convertFromDefault(amount) {
    return parseFloat(amount) * this.exchangeRate;
  }

  convertToDefault(amount) {
    return parseFloat(amount) / this.exchangeRate;
  }
}

export const SUPPORTED_CURRENCIES = [
  new Currency({
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    exchangeRate: 1.0,
    isDefault: true,
    position: 'before'
  }),
  new Currency({
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    exchangeRate: 0.85,
    position: 'before'
  }),
  new Currency({
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    exchangeRate: 0.73,
    position: 'before'
  }),
  new Currency({
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    exchangeRate: 83.0,
    position: 'before'
  }),
  new Currency({
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    exchangeRate: 150.0,
    position: 'before',
    decimalPlaces: 0
  }),
  new Currency({
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    exchangeRate: 1.35,
    position: 'before'
  }),
  new Currency({
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    exchangeRate: 1.55,
    position: 'before'
  }),
  new Currency({
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    exchangeRate: 0.88,
    position: 'after'
  }),
  new Currency({
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    exchangeRate: 7.3,
    position: 'before'
  }),
  new Currency({
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    exchangeRate: 1340.0,
    position: 'before',
    decimalPlaces: 0
  })
];

export default Currency;

