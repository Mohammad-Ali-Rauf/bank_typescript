import fs from "fs";
import inquirer from "inquirer";
class Account {
    constructor(holder, balance, history, accountNumber = '') {
        this.holder = holder;
        this.balance = balance;
        this.history = history;
        this.accountNumber = accountNumber || this.generateAccountNumber();
    }
    generateAccountNumber() {
        return `AC-${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    }
    toString() {
        return `
    Account Details:
    Account Holder: ${this.holder}
    Account Number: ${this.accountNumber}
    Balance: ${this.balance}
    Account History: ${this.history}
    `;
    }
    deposit(amount) {
        this.balance += amount;
        this.history.push(`Deposited: $${amount}`);
    }
    withdraw(amount) {
        if (amount <= this.balance) {
            this.balance -= amount;
            this.history.push(`Withdrawn: $${amount}`);
        }
        else {
            console.log("Insufficient funds!");
        }
    }
    transfer(amount, recipient) {
        if (amount <= this.balance) {
            this.balance -= amount;
            recipient.balance += amount;
            this.history.push(`Transferred: $${amount} to Account ${recipient.accountNumber}`);
            recipient.history.push(`Received: $${amount} from Account ${this.accountNumber}`);
        }
        else {
            console.log("Insufficient funds!");
        }
    }
}
const FILE_PATH = "./users.json"; // File path to store user data
// Load existing user data from the file
function loadUsers() {
    try {
        const data = fs.readFileSync(FILE_PATH, "utf8");
        const jsonData = JSON.parse(data);
        const users = jsonData.map((user) => new Account(user.holder, user.balance, user.history, user.accountNumber));
        return users;
    }
    catch (error) {
        // If the file doesn't exist or there's an error, return an empty array
        return [];
    }
}
// Save the updated user data to the file
function saveUsers(users) {
    const jsonData = users.map((user) => ({
        holder: user.holder,
        balance: user.balance,
        history: user.history,
        accountNumber: user.accountNumber,
    }));
    const data = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(FILE_PATH, data, "utf8");
}
const users = loadUsers(); // Array to store user accounts
async function createAccount() {
    const answer = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is your name?",
        },
        {
            type: "number",
            name: "balance",
            message: "Enter initial balance (USD):",
        },
    ]);
    const accountHolder = answer.name;
    const initialBalance = answer.balance;
    const account = new Account(accountHolder, initialBalance, []);
    users.push(account); // Add the user account to the array of users
    console.log("Account created successfully!");
    console.log(account.toString());
    saveUsers(users); // Save the updated user data to the file
}
async function login() {
    const answer = await inquirer.prompt([
        {
            type: "input",
            name: "accountNumber",
            message: "Enter your account number:",
        },
    ]);
    const accountNumber = answer.accountNumber;
    const user = users.find((account) => account.accountNumber === accountNumber);
    if (user) {
        console.log(user.toString());
        await performTransactions(user);
    }
    else {
        console.log("Account not found!");
    }
}
async function performTransactions(user) {
    while (true) {
        const answer = await inquirer.prompt([
            {
                type: "list",
                name: "option",
                message: "Select an option:",
                choices: ["Deposit", "Withdraw", "Transfer", "Exit"],
            },
        ]);
        const option = answer.option;
        if (option === "Deposit") {
            await performDeposit(user);
        }
        else if (option === "Withdraw") {
            await performWithdrawal(user);
        }
        else if (option === "Transfer") {
            await performTransfer(user);
        }
        else if (option === "Exit") {
            break;
        }
    }
}
async function performDeposit(user) {
    const answer = await inquirer.prompt([
        {
            type: "number",
            name: "amount",
            message: "Enter deposit amount (USD):",
        },
    ]);
    const amount = answer.amount;
    user.deposit(amount);
    console.log(`$${amount} deposited successfully.`);
    console.log(user.toString());
    saveUsers(users); // Save the updated user data to the file
}
async function performWithdrawal(user) {
    const answer = await inquirer.prompt([
        {
            type: "number",
            name: "amount",
            message: "Enter withdrawal amount (USD):",
        },
    ]);
    const amount = answer.amount;
    user.withdraw(amount);
    console.log(`$${amount} withdrawn successfully.`);
    console.log(user.toString());
    saveUsers(users); // Save the updated user data to the file
}
async function performTransfer(user) {
    const answer = await inquirer.prompt([
        {
            type: "number",
            name: "amount",
            message: "Enter transfer amount (USD):",
        },
        {
            type: "input",
            name: "recipientAccountNumber",
            message: "Enter recipient's account number:",
        },
    ]);
    const amount = answer.amount;
    const recipientAccountNumber = answer.recipientAccountNumber;
    const recipient = users.find((account) => account.accountNumber === recipientAccountNumber);
    if (recipient) {
        user.transfer(amount, recipient);
        console.log(`$${amount} transferred to Account ${recipientAccountNumber} successfully.`);
        console.log(user.toString());
        saveUsers(users); // Save the updated user data to the file
    }
    else {
        console.log("Recipient's account not found!");
    }
}
async function main() {
    while (true) {
        const answer = await inquirer.prompt([
            {
                type: "list",
                name: "option",
                message: "Select an option:",
                choices: ["Create Account", "Login", "Exit"],
            },
        ]);
        const option = answer.option;
        if (option === "Create Account") {
            await createAccount();
        }
        else if (option === "Login") {
            await login();
        }
        else if (option === "Exit") {
            break;
        }
    }
}
main();
