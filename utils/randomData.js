const Logger = require('./logger');

/**
 * RandomData - Utility for generating random test data
 * Use only for scenarios explicitly designed for randomization
 */
class RandomData {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Generate random Indian Mobile Number (10 digits starting with 6-9)
   */
  generateIndianMobile() {
    const firstDigit = this.generateRandomNumber(6, 9);
    const rest = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${firstDigit}${rest}`;
  }

  /**
   * Generate valid-looking random GSTIN
   */
  generateGSTIN() {
    // Format: 2 digits (State code 01-35) + 5 letters + 4 digits + 1 letter + 1 digit/letter + Z + 1 digit/letter
    const stateCode = this.generateRandomNumber(10, 35);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let panAlpha = '';
    for (let i = 0; i < 5; i++) panAlpha += chars.charAt(Math.floor(Math.random() * chars.length));
    const panNum = this.generateRandomNumber(1000, 9999);
    const panChar = chars.charAt(Math.floor(Math.random() * chars.length));
    const entityNum = this.generateRandomNumber(1, 9);
    const checksum = chars.charAt(Math.floor(Math.random() * chars.length));

    return `${stateCode}${panAlpha}${panNum}${panChar}${entityNum}Z${checksum}`;
  }

  /**
   * Generate random Partner ID
   */
  generatePartnerId() {
    return `PID-${this.generateRandomNumber(100000, 999999)}`;
  }

  /**
   * Generate random Partner PIN
   */
  generatePartnerPin() {
    return this.generateRandomNumber(100000, 999999).toString();
  }

  /**
   * Calculate exact GSTIN Checksum
   */
  calculateGSTINChecksum(gstinWithoutChecksum) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let hash = 0;
    for (let i = 0; i < gstinWithoutChecksum.length; i++) {
        let val = chars.indexOf(gstinWithoutChecksum[i]);
        let factor = (i % 2 === 0) ? 1 : 2;
        let product = val * factor;
        hash += Math.floor(product / 36) + (product % 36);
    }
    let check = (36 - (hash % 36)) % 36;
    return chars[check];
  }

  /**
   * Generate valid, checksum-correct GSTIN based on state code
   */
  generateGSTIN(stateCode = '07') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let panAlpha = '';
    for (let i = 0; i < 5; i++) panAlpha += chars.charAt(Math.floor(Math.random() * chars.length));
    const panNum = this.generateRandomNumber(1000, 9999);
    const panChar = chars.charAt(Math.floor(Math.random() * chars.length));
    const entityNum = this.generateRandomNumber(1, 9);
    
    const base = `${stateCode}${panAlpha}${panNum}${panChar}${entityNum}Z`;
    const checksum = this.calculateGSTINChecksum(base);
    return `${base}${checksum}`;
  }

  /**
   * Generate consistent Partner Data (State, GSTIN, Pincode, City)
   */
  generateConsistentPartnerData() {
    const locations = [
      { stateCode: '07', state: 'Delhi', city: 'New Delhi', pincode: '110001' },
      { stateCode: '09', state: 'Uttar Pradesh', city: 'Noida', pincode: '201301' },
      { stateCode: '27', state: 'Maharashtra', city: 'Mumbai', pincode: '400001' },
      { stateCode: '29', state: 'Karnataka', city: 'Bangalore', pincode: '560001' }
    ];
    const loc = this.pickRandom(locations);
    return {
      gstin: this.generateGSTIN(loc.stateCode),
      state: loc.state,
      city: loc.city,
      pincode: loc.pincode,
      mobile: `9${this.generateRandomNumber(1000, 9999)}${this.generateRandomNumber(10000, 99999)}`,
      partnerId: `PID${this.generateRandomString(7).toUpperCase()}`, // Exactly 10 chars
      partnerPin: `1${Math.floor(Date.now() / 1000).toString().slice(-5)}`, // Exactly 6 digits starting with 1
      companyName: this.generateRandomCompanyName()
    };
  }

  /**
   * Generate random email
   */
  generateRandomEmail(domain = 'testuser.com') {
    const randomString = Math.random().toString(36).substring(2, 8);
    const email = `user${randomString}@${domain}`;
    this.logger.debug(`Generated random email: ${email}`);
    return email;
  }

  /**
   * Generate random password
   */
  generateRandomPassword(length = 12) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    this.logger.debug('Generated random password');
    return password;
  }

  /**
   * Generate random string
   */
  generateRandomString(length = 10) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Generate random number
   */
  generateRandomNumber(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random phone number
   */
  generateRandomPhoneNumber() {
    const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    this.logger.debug(`Generated random phone: ${phone}`);
    return phone;
  }

  /**
   * Generate random address
   */
  generateRandomAddress() {
    const street = `${this.generateRandomNumber(1, 999)} ${this.generateRandomString(8)} Street`;
    const city = this.generateRandomString(8);
    const zip = this.generateRandomNumber(10000, 99999);
    const address = `${street}, ${city}, ${zip}`;
    this.logger.debug(`Generated random address: ${address}`);
    return address;
  }

  /**
   * Generate random company name
   */
  generateRandomCompanyName() {
    const prefixes = ['Tech', 'Global', 'Smart', 'Digital', 'Cloud'];
    const suffixes = ['Solutions', 'Systems', 'Services', 'Technologies', 'Labs'];
    const name = `${prefixes[this.generateRandomNumber(0, prefixes.length - 1)]} ${suffixes[this.generateRandomNumber(0, suffixes.length - 1)]} ${this.generateRandomString(5).toUpperCase()}`;
    return name;
  }

  /**
   * Pick random item from array
   */
  pickRandom(array) {
    if (!Array.isArray(array) || array.length === 0) {
      throw new Error('Invalid array');
    }
    return array[this.generateRandomNumber(0, array.length - 1)];
  }

  /**
   * Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate random UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

module.exports = new RandomData();
