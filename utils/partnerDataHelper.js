const dbHelper = require('./dbHelper');
const Logger = require('./logger');

class PartnerDataHelper {
  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Dynamically query DB for Channel Partners where wallet amount = 0
   * Uses exact SQL query specified by user:
   * SELECT w.fk_channel_partner_id, cp."name", * FROM wallet w JOIN channel_partner cp ON w.fk_channel_partner_id = cp.channel_partner_id WHERE w."partner_type" = 'channel_partner' AND w.amount = 0;
   */
  /**
   * Dynamically query DB for an enabled Channel Partner
   */
  async getEnabledChannelPartnerFromDB() {
    const query = `
      SELECT cp."name" AS partner_name, cp."status", cp.created_at, cp.* 
      FROM channel_partner cp 
      WHERE cp."status" = 'enable' 
      AND cp."partner_type" = 'channel_partner' 
      ORDER BY cp.created_at DESC;
    `;

    this.logger.info(`Executing DB query to get enabled channel partner details:\n${query}`);

    await dbHelper.connect();
    const rows = await dbHelper.executeSelect(query);
    await dbHelper.close();

    if (!rows || rows.length === 0) {
      throw new Error('Database query returned 0 enabled channel partners.');
    }

    // Pick a valid channel partner with name
    const validRow = rows.find(r => r.partner_name && String(r.partner_name).trim() !== '') || rows[0];

    this.logger.info(`DB Query returned ${rows.length} records. Dynamically selected enabled partner from DB: ${validRow.partner_name} (ID: ${validRow.channel_partner_id})`);

    return {
      partnerId: validRow.channel_partner_id,
      partnerName: validRow.partner_name,
      rawRecord: validRow
    };
  }

  async getZeroBalanceChannelPartnerFromDB() {
    const query = `
      SELECT w.fk_channel_partner_id, cp."name" AS partner_name, cp.*, w.amount AS wallet_amount, COALESCE(cl.credit_limit, 0) AS credit_limit
      FROM wallet w
      JOIN channel_partner cp ON w.fk_channel_partner_id = cp.channel_partner_id
      LEFT JOIN credit_limit cl ON cl.fk_channel_partner_id = cp.channel_partner_id
      WHERE w."partner_type" = 'channel_partner' 
      AND w.amount = 0 
      AND (cl.credit_limit IS NULL OR (cl.credit_limit - COALESCE(cl.credit_limit_used, 0)) <= 0)
      AND cp."status" = 'enable' 
      AND EXISTS (SELECT 1 FROM subscription s WHERE s.fk_channel_partner_id = cp.channel_partner_id)
      ORDER BY cp.channel_partner_id DESC;
    `;

    this.logger.info(`Executing DB query to get zero balance channel partner details:\n${query}`);

    await dbHelper.connect();
    const rows = await dbHelper.executeSelect(query);
    await dbHelper.close();

    if (!rows || rows.length === 0) {
      throw new Error('Database query returned 0 channel partners with wallet amount = 0, credit limit = 0, and status = enable.');
    }

    // Pick a valid channel partner with name
    const validRow = rows.find(r => r.partner_name && String(r.partner_name).trim() !== '') || rows[0];

    this.logger.info(`DB Query returned ${rows.length} records. Dynamically selected partner from DB: ${validRow.partner_name} (ID: ${validRow.fk_channel_partner_id})`);

    return {
      partnerId: validRow.fk_channel_partner_id || validRow.channel_partner_id,
      partnerName: validRow.partner_name || validRow.name,
      walletAmount: parseFloat(validRow.wallet_amount || 0),
      creditLimit: parseFloat(validRow.credit_limit || 0),
      rawRecord: validRow
    };
  }

  /**
   * Dynamically query DB for Channel Partners where wallet amount = 0 BUT credit limit > 0
   */
  async getZeroBalanceWithCreditChannelPartnerFromDB() {
    const query = `
      SELECT cl.fk_channel_partner_id, cp."name" AS partner_name, cp.*, w.amount AS wallet_amount, (cl.credit_limit - COALESCE(cl.credit_limit_used, 0)) AS credit_limit
      FROM credit_limit cl
      JOIN channel_partner cp ON cl.fk_channel_partner_id = cp.channel_partner_id
      JOIN wallet w ON w.fk_channel_partner_id = cp.channel_partner_id
      WHERE (cl.credit_limit - COALESCE(cl.credit_limit_used, 0)) > 5000 
      AND w.amount = 0 
      AND cp."status" = 'enable'
      AND cp."partner_type" = 'channel_partner'
      AND EXISTS (SELECT 1 FROM subscription s WHERE s.fk_channel_partner_id = cp.channel_partner_id)
      ORDER BY cl.credit_limit DESC;
    `;

    this.logger.info(`Executing DB query to get zero balance but available credit channel partner details:\n${query}`);

    await dbHelper.connect();
    const rows = await dbHelper.executeSelect(query);
    await dbHelper.close();

    if (!rows || rows.length === 0) {
      throw new Error('Database query returned 0 channel partners with wallet amount = 0, credit limit > 1000, and status = enable.');
    }

    // Pick a valid channel partner with name
    const validRow = rows.find(r => r.partner_name && String(r.partner_name).trim() !== '') || rows[0];

    this.logger.info(`DB Query returned ${rows.length} records. Dynamically selected partner from DB with Credit Limit: ${validRow.partner_name} (ID: ${validRow.fk_channel_partner_id})`);

    return {
      partnerId: validRow.fk_channel_partner_id || validRow.channel_partner_id,
      partnerName: validRow.partner_name || validRow.name,
      walletAmount: parseFloat(validRow.wallet_amount || 0),
      creditLimit: parseFloat(validRow.credit_limit || 0),
      rawRecord: validRow
    };
  }

  /**
   * Mark a user as verified in DB so that enable/disable toggling is permitted
   */
  async verifyUserInDB(userName, initialStatus = 'disable') {
    this.logger.info(`Marking user '${userName}' as verified in database with initial status '${initialStatus}'...`);
    await dbHelper.connect();
    await dbHelper.executeUpdate(
      `UPDATE pra_user SET phone_verified = 'yes', email_verified = 'yes', status = $1 WHERE name = $2`,
      [initialStatus, userName]
    );
    await dbHelper.executeUpdate(
      `UPDATE channel_partner_user SET status = $1 
       WHERE fk_user_id IN (SELECT user_id FROM pra_user WHERE name = $2)`,
      [initialStatus, userName]
    );
    await dbHelper.close();
  }
}

module.exports = new PartnerDataHelper();
