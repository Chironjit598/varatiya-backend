const FamilyExpense = require('./familyExpense.model');

class FamilyExpenseService {
  formatExpense(doc) {
    if (!doc) return null;
    const obj = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
    obj.id = (obj.id || obj._id || '').toString();
    obj._id = obj._id || obj.id;
    if (obj.userId) obj.userId = obj.userId.toString();
    if (obj.date) obj.date = new Date(obj.date).toISOString();
    return obj;
  }

  /**
   * Get all family expenses for logged-in user
   */
  async getExpenses(userId) {
    const docs = await FamilyExpense.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const expenses = docs.map((d) => this.formatExpense(d));
    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const paidAmount = expenses
      .filter((e) => e.isPaid)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;

    return {
      expenses,
      familyExpenses: expenses,
      summary: {
        totalAmount,
        paidAmount,
        unpaidAmount,
      },
    };
  }

  /**
   * Create a new family expense item
   */
  async createExpense(userId, payload) {
    const { title, category, amount, date, isPaid } = payload;

    if (!title || String(title).trim().length === 0) {
      const error = new Error('খরচের বিবরণ দিন (Title is required)');
      error.statusCode = 400;
      throw error;
    }

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) < 0) {
      const error = new Error('টাকার সঠিক পরিমাণ দিন (Valid amount is required)');
      error.statusCode = 400;
      throw error;
    }

    const expense = await FamilyExpense.create({
      userId,
      title: String(title).trim(),
      category: category ? String(category).trim() : 'Others',
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      isPaid: Boolean(isPaid),
    });

    return this.formatExpense(expense);
  }

  /**
   * Toggle paid/unpaid status of a family expense
   */
  async togglePaid(expenseId, userId) {
    const expense = await FamilyExpense.findOne({ _id: expenseId, userId });
    if (!expense) {
      const error = new Error('খরচের হিসাবটি পাওয়া যায়নি (Expense not found)');
      error.statusCode = 404;
      throw error;
    }

    expense.isPaid = !expense.isPaid;
    await expense.save();

    return this.formatExpense(expense);
  }

  /**
   * Delete a family expense item
   */
  async deleteExpense(expenseId, userId) {
    const expense = await FamilyExpense.findOne({ _id: expenseId, userId });
    if (!expense) {
      const error = new Error('খরচের হিসাবটি পাওয়া যায়নি (Expense not found)');
      error.statusCode = 404;
      throw error;
    }

    await expense.deleteOne();
    return true;
  }
}

module.exports = new FamilyExpenseService();

