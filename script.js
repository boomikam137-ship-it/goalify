let currentGoal = null;
let transactions = [];
let loggedIn = false;


// LOGIN

function login() {

    const name = document.getElementById("loginName").value.trim();
    const email = document.getElementById("loginEmail").value.trim();

    if (name === "" || email === "") {
        alert("Please enter your name and email.");
        return;
    }

    loggedIn = true;

    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("mainWebsite").classList.remove("hidden");

    document.querySelector(".brand span").textContent = "Goalify";

    localStorage.setItem("goalifyUser", name);
    localStorage.setItem("goalifyEmail", email);
}


// LOGOUT

function logout() {

    loggedIn = false;

    document.getElementById("mainWebsite").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
}


// SCROLL

function scrollToGoals() {

    document.getElementById("goals")
        .scrollIntoView({ behavior: "smooth" });
}


// CREATE GOAL

function createGoal() {

    if (!loggedIn) {
        alert("Please login first.");
        return;
    }

    const name =
        document.getElementById("goalName").value.trim();

    const target =
        Number(document.getElementById("goalAmount").value);

    const daily =
        Number(document.getElementById("dailySaving").value);


    if (name === "" || target <= 0 || daily <= 0) {

        alert("Please enter valid goal details.");
        return;
    }


    const days = Math.ceil(target / daily);

    currentGoal = {

        name: name,
        target: target,
        daily: daily,
        saved: 0,
        days: days,
        created: new Date().toLocaleDateString()

    };


    document.getElementById("goalName").value = "";
    document.getElementById("goalAmount").value = "";
    document.getElementById("dailySaving").value = "";


    showAdaptiveAlert();

    renderGoal();

    updateProgress();

}


// ADAPTIVE ALERT

function showAdaptiveAlert() {

    const alertBox =
        document.getElementById("alertBox");

    const target = currentGoal.target;
    const daily = currentGoal.daily;

    const days = currentGoal.days;


    if (target >= 50000 && days <= 180) {

        alertBox.innerHTML = `
            <div class="alert">
                ⚡ Smart Alert: Your target amount is high
                and your saving period is short.
                Consider increasing your daily saving amount.
            </div>
        `;

    }

    else if (daily < target / 365) {

        alertBox.innerHTML = `
            <div class="alert">
                💡 Smart Suggestion: Your current daily saving
                may take a long time. Try increasing it.
            </div>
        `;

    }

    else {

        alertBox.innerHTML = `
            <div class="alert">
                🌱 Great plan! Your daily saving strategy
                is ready to grow your goal.
            </div>
        `;
    }
}


// RENDER GOAL

function renderGoal() {

    const container =
        document.getElementById("goalContainer");


    const percentage =
        Math.min(
            100,
            (currentGoal.saved / currentGoal.target) * 100
        );


    let tree = "🌱";

    if (percentage >= 25)
        tree = "🌿";

    if (percentage >= 50)
        tree = "🌳";

    if (percentage >= 75)
        tree = "🌲";

    if (percentage >= 100)
        tree = "🌳🌟";


    const remaining =
        Math.max(
            0,
            currentGoal.target - currentGoal.saved
        );


    const estimatedRemainingDays =
        remaining > 0
        ? Math.ceil(remaining / currentGoal.daily)
        : 0;


    container.innerHTML = `

        <div class="goal-card">

            <div class="goal-top">

                <div class="goal-title">
                    🎯 ${currentGoal.name}
                </div>

                <strong>
                    ${percentage.toFixed(0)}%
                </strong>

            </div>


            <div class="goal-info">

                <p>
                    Target:
                    <strong>₹${currentGoal.target.toLocaleString()}</strong>
                </p>

                <p>
                    Saved:
                    <strong>₹${currentGoal.saved.toLocaleString()}</strong>
                </p>

                <p>
                    Remaining:
                    <strong>₹${remaining.toLocaleString()}</strong>
                </p>

                <p>
                    Daily Saving:
                    <strong>₹${currentGoal.daily}</strong>
                </p>

                <p>
                    Estimated Time:
                    <strong>${currentGoal.days} days</strong>
                </p>

                <p>
                    Remaining Time:
                    <strong>${estimatedRemainingDays} days</strong>
                </p>

            </div>


            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width:${percentage}%">
                </div>

            </div>


            <div class="tree-area">

                <div class="tree">
                    ${tree}
                </div>

                <div class="tree-message">

                    ${
                        percentage >= 100
                        ? "🎉 Goal Achieved! Your dream is ready!"
                        : "Keep saving — your tree is growing!"
                    }

                </div>

            </div>


            <div class="goal-actions">

                <button onclick="openPayment()">
                    💳 Add Payment
                </button>


                ${
                    percentage >= 100

                    ?

                    `<button
                        class="buy-btn"
                        onclick="openBuy()">
                        🛍️ Buy Now
                    </button>`

                    :

                    `<button
                        class="disabled-btn"
                        disabled>
                        🔒 Buy Now
                    </button>`
                }

            </div>

        </div>
    `;
}


// PAYMENT MODAL

function openPayment() {

    if (!currentGoal) {
        alert("Create a goal first.");
        return;
    }

    document.getElementById("paymentGoalName")
        .textContent =
        "Saving for: " + currentGoal.name;

    document.getElementById("paymentModal")
        .style.display = "flex";
}


function closePayment() {

    document.getElementById("paymentModal")
        .style.display = "none";
}


// MAKE PAYMENT

function makePayment() {

    const amount =
        Number(
            document.getElementById("paymentAmount").value
        );

    const method =
        document.getElementById("paymentMethod").value;


    if (amount <= 0 || method === "") {

        alert("Enter amount and payment method.");
        return;
    }


    if (currentGoal.saved + amount > currentGoal.target) {

        alert(
            "Payment exceeds your remaining goal amount."
        );

        return;
    }


    currentGoal.saved += amount;


    transactions.unshift({

        type: "Payment",
        goal: currentGoal.name,
        amount: amount,
        method: method,
        date: new Date().toLocaleString()

    });


    document.getElementById("paymentAmount").value = "";

    document.getElementById("paymentMethod").value = "";


    closePayment();

    renderGoal();

    updateProgress();

    renderHistory();


    if (currentGoal.saved === currentGoal.target) {

        alert(
            "🎉 Congratulations! Goal achieved. You can now Buy Now!"
        );

    } else {

        alert(
            `₹${amount} added successfully! Keep growing 🌱`
        );

    }
}


// BUY MODAL

function openBuy() {

    if (currentGoal.saved < currentGoal.target) {

        alert(
            "Complete your savings goal before purchasing."
        );

        return;
    }


    document.getElementById("buyGoalName")
        .textContent =
        "Product: " + currentGoal.name;


    document.getElementById("buyModal")
        .style.display = "flex";
}


function closeBuy() {

    document.getElementById("buyModal")
        .style.display = "none";
}


// PURCHASE

function purchaseGoal() {

    const address =
        document.getElementById("buyAddress").value.trim();

    const payment =
        document.getElementById("buyPayment").value;


    if (address === "" ||
        payment === "Select purchase payment") {

        alert(
            "Please enter delivery address and payment method."
        );

        return;
    }


    transactions.unshift({

        type: "Purchase",
        goal: currentGoal.name,
        amount: currentGoal.target,
        method: payment,
        date: new Date().toLocaleString()

    });


    closeBuy();

    renderHistory();


    alert(
        "🛍️ Purchase confirmed successfully! 🎉"
    );

}


// HISTORY

function renderHistory() {

    const container =
        document.getElementById("historyContainer");


    if (transactions.length === 0) {

        container.innerHTML =
            "<p>No transactions yet.</p>";

        return;
    }


    container.innerHTML =
        transactions.map(item => `

            <div class="history-item">

                <div>

                    ${
                        item.type === "Payment"
                        ? "💳"
                        : "🛍️"
                    }

                    <strong>
                        ${item.type}
                    </strong>

                    — ${item.goal}

                </div>


                <div>
                    ₹${item.amount.toLocaleString()}
                </div>


                <div>
                    ${item.method}
                </div>


                <div>
                    ${item.date}
                </div>

            </div>

        `).join("");
}


// OVERALL PROGRESS

function updateProgress() {

    if (!currentGoal) {

        document.getElementById("overallProgress")
            .textContent = "0%";

        document.getElementById("progressText")
            .textContent =
            "Create a goal to start your journey.";

        return;
    }


    const percentage =
        Math.min(
            100,
            (currentGoal.saved /
                currentGoal.target) * 100
        );


    document.getElementById("overallProgress")
        .textContent =
        percentage.toFixed(0) + "%";


    document.getElementById("progressText")
        .textContent =
        `₹${currentGoal.saved.toLocaleString()} saved out of ₹${currentGoal.target.toLocaleString()}.`;
}


// SUPPORT

function support() {

    alert(
        "🆘 Goalify Support\n\n" +
        "Email: boomikam137@gmail.com\n" +
        "Contact: 6383905764"
    );

}


// FEEDBACK

function sendFeedback() {

    const feedback =
        document.getElementById("feedback")
            .value.trim();


    if (feedback === "") {

        alert("Please enter your feedback.");

        return;
    }


    alert(
        "💚 Thank you for your valuable feedback!"
    );


    document.getElementById("feedback").value = "";

}


// PAGE LOAD

window.onload = function() {

    renderHistory();

};