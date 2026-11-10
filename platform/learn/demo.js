(function(){
  "use strict";

  /* --- Session plans --- */
  var plans = {
    "5":  { title:"5-minute plan — Keep the streak", items:["Review 3 due cards","Flip and grade each card once","Stop on time — small and done beats long and skipped"] },
    "10": { title:"10-minute plan — Learn + recall", items:["Review 5 due cards","Learn 2 new cards from the Verdant-9 bay guide","Finish with 1 quiz question from memory"] },
    "15": { title:"15-minute plan — Full loop", items:["Review all 5 sample cards","Learn the light-cycle and hydroponics notes","Take the full 3-question quiz below","Note one card to revisit tomorrow — spaced repetition in action"] }
  };
  var planEl = document.getElementById("plan");
  function renderPlan(mins){
    var p = plans[mins];
    planEl.innerHTML = "<strong>" + p.title + "</strong><ul>" +
      p.items.map(function(i){ return "<li>" + i + "</li>"; }).join("") + "</ul>";
    document.querySelectorAll("[data-minutes]").forEach(function(b){
      b.setAttribute("aria-pressed", b.getAttribute("data-minutes") === mins ? "true" : "false");
    });
  }
  document.querySelectorAll("[data-minutes]").forEach(function(b){
    b.addEventListener("click", function(){ renderPlan(b.getAttribute("data-minutes")); });
  });
  renderPlan("5");

  /* --- Flashcards (fictional) --- */
  var cards = [
    { q:"On Verdant-9, what does a 'sol-cycle' mean for Bay 3 tomatoes?",
      a:"A 16-hour light / 8-hour dark rhythm programmed for the bay. The crew shortens it by 30 minutes during maintenance weeks." },
    { q:"Why do Verdant-9 gardeners rotate the hydroponic trays every cycle?",
      a:"To even out light and airflow. Without rotation, the outer plants shade the inner row and yields drop." },
    { q:"What is 'mist rationing' aboard Verdant-9?",
      a:"A fictional water-saving rule: seedlings get fine mist twice per cycle, mature greens get a deeper soak once per cycle." },
    { q:"Which fictional plant is Verdant-9's fastest oxygen producer?",
      a:"Vesper kelp — an invented station plant grown in translucent tanks along the habitat ring." },
    { q:"What alarm colour means 'check the nutrient mix' on Verdant-9?",
      a:"Amber leaf. A fictional bay signal: test pH and nutrient strength before the next light cycle." }
  ];
  var idx = 0, flipped = false, reviewed = 0, gotIt = 0, again = 0;
  var cardEl = document.getElementById("flashcard");
  var sideEl = document.getElementById("card-side");
  var textEl = document.getElementById("card-text");
  var hintEl = document.getElementById("card-hint");

  function renderCard(){
    sideEl.textContent = flipped ? "Answer" : "Question";
    textEl.textContent = flipped ? cards[idx].a : cards[idx].q;
    hintEl.textContent = flipped ? "Grade yourself below" : "Tap to reveal the answer";
    document.getElementById("progress-count").textContent = "Card " + (idx+1) + " of " + cards.length;
    document.getElementById("reviewed-count").textContent = reviewed;
    document.getElementById("gotit-count").textContent = gotIt;
    document.getElementById("again-count").textContent = again;
  }
  function flip(){ flipped = !flipped; renderCard(); }
  cardEl.addEventListener("click", flip);
  cardEl.addEventListener("keydown", function(e){
    if(e.key === "Enter" || e.key === " "){ e.preventDefault(); flip(); }
  });
  document.getElementById("next-card").addEventListener("click", function(){
    idx = (idx + 1) % cards.length; flipped = false; renderCard();
  });
  document.getElementById("prev-card").addEventListener("click", function(){
    idx = (idx - 1 + cards.length) % cards.length; flipped = false; renderCard();
  });
  document.getElementById("gotit-btn").addEventListener("click", function(){
    reviewed++; gotIt++; idx = (idx + 1) % cards.length; flipped = false; renderCard();
  });
  document.getElementById("again-btn").addEventListener("click", function(){
    reviewed++; again++; flipped = true; renderCard();
  });
  renderCard();

  /* --- Quiz (fictional, instant feedback) --- */
  var quiz = [
    { q:"1. How long is a Verdant-9 sol-cycle for Bay 3 tomatoes?",
      choices:["12 hours light, 12 hours dark","16 hours light, 8 hours dark","24 hours of constant light"],
      answer:1, why:"Correct pattern from the cards: 16 on, 8 off." },
    { q:"2. Why rotate hydroponic trays on Verdant-9?",
      choices:["To even out light and airflow","To make the plants dizzy","Rotation is purely decorative"],
      answer:0, why:"Rotation prevents the outer row shading the inner row." },
    { q:"3. What does an 'amber leaf' signal mean?",
      choices:["Harvest day","Check the nutrient mix","Turn off all bay lights"],
      answer:1, why:"Amber leaf = test pH and nutrients before the next cycle." }
  ];
  var quizEl = document.getElementById("quiz");
  var answered = 0, correctCount = 0;
  function updateScore(){
    document.getElementById("quiz-score").textContent =
      correctCount + " correct · " + answered + " / " + quiz.length + " answered";
  }
  quiz.forEach(function(item, qi){
    var block = document.createElement("div");
    block.className = "quiz-q";
    var qtext = document.createElement("p");
    qtext.className = "qtext"; qtext.textContent = item.q;
    block.appendChild(qtext);
    var choices = document.createElement("div");
    choices.className = "choices";
    var feedback = document.createElement("p");
    feedback.className = "feedback"; feedback.setAttribute("aria-live","polite");
    var done = false;
    item.choices.forEach(function(choice, ci){
      var btn = document.createElement("button");
      btn.type = "button"; btn.textContent = choice;
      btn.addEventListener("click", function(){
        if(done) return;
        done = true; answered++;
        var isCorrect = ci === item.answer;
        if(isCorrect){ correctCount++; btn.classList.add("correct"); feedback.textContent = "✓ Correct. " + item.why; feedback.classList.add("good"); }
        else { btn.classList.add("wrong"); feedback.textContent = "✗ Not quite. " + item.why; feedback.classList.add("bad"); }
        choices.querySelectorAll("button").forEach(function(b){ b.disabled = true; });
        updateScore();
      });
      choices.appendChild(btn);
    });
    block.appendChild(choices);
    block.appendChild(feedback);
    quizEl.appendChild(block);
  });
  updateScore();
})();
