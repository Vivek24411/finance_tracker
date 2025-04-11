let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart;

function init() {
    updateSummary();
    renderTransactionList();
    updateChart();
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

document.getElementById('transactionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const transaction = {
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        type: document.querySelector('input[name="type"]:checked').value
    };

    transactions.push(transaction);
    saveTransactions();
    updateSummary();
    renderTransactionList();
    updateChart();
    this.reset();
});

function updateSummary() {
    let income = 0, expense = 0;
    for (let t of transactions) {
        if (t.type === 'income') income += t.amount;
        else if (t.type === 'expense') expense += t.amount;
    }
    const balance = income - expense;

    document.getElementById('balance').textContent = '$' + balance.toFixed(2);
    document.getElementById('income').textContent = '$' + income.toFixed(2);
    document.getElementById('expense').textContent = '$' + expense.toFixed(2);
}

function renderTransactionList(filter = 'all') {
    const list = document.getElementById('transactionList');
    list.innerHTML = '';

    const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

    filtered.forEach((t, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
<div>
 <h4>${t.description}</h4>
 <div style="display:flex;gap:0.5rem;align-items:center;margin-top:0.5rem;">
  <span class="category-badge">${t.category}</span>
  <small>${t.date}</small>
 </div>
</div>
<div style="display:flex;align-items:center;gap:1rem;">
 <span class="transaction-amount ${t.type}">
  ${t.type === 'income' ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}
 </span>
 <button class="delete-btn" onclick="deleteTransaction(${index})">×</button>
</div>`;
        list.appendChild(li);
    });
}

window.deleteTransaction = function (index) {
    transactions.splice(index, 1);
    saveTransactions();
    updateSummary();
    renderTransactionList();
    updateChart();
};

document.querySelectorAll('.filter button').forEach(button => {
    button.addEventListener('click', function () {
        document.querySelectorAll('.filter button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderTransactionList(this.dataset.filter);
    });
});

function updateChart() {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) myChart.destroy();

    const colors = {
        income: getComputedStyle(document.documentElement).getPropertyValue('--income').trim(),
        expense: getComputedStyle(document.documentElement).getPropertyValue('--expense').trim()
    };

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [
                    transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0),
                    transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0)
                ],
                backgroundColor: [colors.income, colors.expense],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 15, padding: 20 } },
                tooltip: {
                    backgroundColor: '#2c3e50',
                    titleFont: { size: 16 },
                    bodyFont: { size: 14 },
                    padding: 12
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
