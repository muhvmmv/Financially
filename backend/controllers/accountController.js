const plaid = require('plaid');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const User = require('../model/User');
const Account = require('../model/Account');
const Transaction = require('../model/Transaction');
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const plaidClient = new plaid.PlaidApi(
  new plaid.Configuration({
    basePath: plaid.PlaidEnvironments[PLAID_ENV],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
    },
  })
);
exports.getProfile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, full_name AS name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Create a Plaid Link token for the frontend
exports.createPlaidLinkToken = async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: req.user.id.toString() },
      client_name: 'Financially',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Plaid link token' });
  }
};
// Exchange Plaid public token for access token
exports.exchangePlaidToken = async (req, res) => {
  const { public_token } = req.body;
  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const access_token = response.data.access_token;

    // Fetch accounts from Plaid
    const accountsResponse = await plaidClient.accountsGet({ access_token });
    const accounts = accountsResponse.data.accounts;

    // Clear old accounts for this user
    await Account.deleteAllForUser(req.user.id);

    // Save new accounts and store access tokens
    const savedAccounts = [];
    for (const acct of accounts) {
      const savedAccount = await Account.create(req.user.id, {
        name: acct.name,
        bank: acct.official_name || acct.institution_name || 'Unknown',
        balance: acct.balances.current || 0,
        type: acct.type,
        plaid_account_id: acct.account_id
      });
      savedAccounts.push(savedAccount);
    }

    // Store access token for future use
    await db.query(
      'UPDATE users SET plaid_access_token = $1 WHERE id = $2',
      [access_token, req.user.id]
    );

    // Fetch and save transactions for each account
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    const endDate = new Date();

    for (const account of savedAccounts) {
      try {
        const transactionsResponse = await plaidClient.transactionsGet({
          access_token,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          options: {
            account_ids: [account.plaid_account_id]
          }
        });

        const transactions = transactionsResponse.data.transactions;
        
        // Save transactions to database
        for (const transaction of transactions) {
          // Skip pending transactions
          if (transaction.pending) continue;

          // Determine transaction type based on amount
          const amount = Math.abs(transaction.amount);
          const type = transaction.amount >= 0 ? 'income' : 'expense';

          // Map Plaid categories to our categories
          const category = mapPlaidCategory(transaction.category || ['Other']);

          await Transaction.create(req.user.id, {
            name: transaction.name,
            category: category,
            amount: amount,
            type: type,
            date: transaction.date,
            account_id: account.id,
            plaid_transaction_id: transaction.transaction_id
          });
        }
      } catch (error) {
        console.error(`Failed to fetch transactions for account ${account.name}:`, error);
      }
    }

    await User.setBankConnected(req.user.id, true);
    res.json({ message: 'Bank connected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Plaid token exchange failed' });
  }
};

// Sync transactions from Plaid (manual refresh)
exports.syncTransactions = async (req, res) => {
  try {
    // Get user's Plaid access token
    const userResult = await db.query(
      'SELECT plaid_access_token FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!userResult.rows[0]?.plaid_access_token) {
      return res.status(400).json({ error: 'No bank connected' });
    }

    const access_token = userResult.rows[0].plaid_access_token;

    // Get user's accounts
    const accounts = await Account.findByUserId(req.user.id);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days for sync
    const endDate = new Date();

    let newTransactionsCount = 0;

    for (const account of accounts) {
      if (!account.plaid_account_id) continue;

      try {
        const transactionsResponse = await plaidClient.transactionsGet({
          access_token,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          options: {
            account_ids: [account.plaid_account_id]
          }
        });

        const transactions = transactionsResponse.data.transactions;
        
        for (const transaction of transactions) {
          // Skip pending transactions
          if (transaction.pending) continue;

          // Check if transaction already exists
          const existingTransaction = await db.query(
            'SELECT id FROM transactions WHERE plaid_transaction_id = $1 AND user_id = $2',
            [transaction.transaction_id, req.user.id]
          );

          if (existingTransaction.rows.length === 0) {
            // New transaction - save it
            const amount = Math.abs(transaction.amount);
            const type = transaction.amount >= 0 ? 'income' : 'expense';
            const category = mapPlaidCategory(transaction.category || ['Other']);

            await Transaction.create(req.user.id, {
              name: transaction.name,
              category: category,
              amount: amount,
              type: type,
              date: transaction.date,
              account_id: account.id,
              plaid_transaction_id: transaction.transaction_id
            });

            newTransactionsCount++;
          }
        }
      } catch (error) {
        console.error(`Failed to sync transactions for account ${account.name}:`, error);
      }
    }

    res.json({ 
      message: 'Transactions synced successfully',
      newTransactions: newTransactionsCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync transactions' });
  }
};

// Helper function to map Plaid categories to our categories
function mapPlaidCategory(plaidCategories) {
  if (!plaidCategories || plaidCategories.length === 0) return 'Other';

  const category = plaidCategories[0].toLowerCase();
  
  const categoryMap = {
    'food and drink': 'Food & Dining',
    'shopping': 'Shopping',
    'transport': 'Transportation',
    'entertainment': 'Entertainment',
    'health and fitness': 'Healthcare',
    'home improvement': 'Housing',
    'utilities': 'Utilities',
    'education': 'Education',
    'travel': 'Travel',
    'transfer': 'Other',
    'payment': 'Other',
    'deposit': 'Income',
    'income': 'Income'
  };

  return categoryMap[category] || 'Other';
}

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }
    
    const user = await User.findByEmail(req.user.email);
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid current password' });
    }
    
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Password update failed' });
  }
};

// Account management methods
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.findByUserId(req.user.id);
    res.json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { name, bank, balance, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    const account = await Account.create(req.user.id, {
      name,
      bank,
      balance: balance || 0,
      type
    });
    
    res.status(201).json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bank, balance, type } = req.body;
    
    const account = await Account.update(id, {
      name,
      bank,
      balance,
      type
    });
    
    res.json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    await Account.delete(id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// Set bank_connected to true for the current user
exports.connectBank = async (req, res) => {
  try {
    await User.setBankConnected(req.user.id, true);
    res.json({ message: 'Bank connected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to connect bank' });
  }
};

// Get bank_connected status for the current user
exports.getBankConnectionStatus = async (req, res) => {
  try {
    const connected = await User.isBankConnected(req.user.id);
    res.json({ bankConnected: connected });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get bank connection status' });
  }
};