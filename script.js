const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzX-djo0V25-_XcAUF-BrVqWv1caqLYwHnjdyj_ErUKfvHhnl-mvFka1cUE4ovHoXV/exec";

const ques = [1, 2, 3, 4, 5, 6, 7];

const ques1 = ques.map((item) => {
  return item + 1;
})

const quesfilter = ques.filter((item) => {
  return item % 2 == 0;
})

const quesreduce = ques.reduce((acc,cur) => {
  return acc + cur;
}, 10)

console.log(ques1,quesfilter,quesreduce)

const questions = [
  {
    text: "What’s the biggest challenge facing your squad right now?",
    options: {
      A: "Keeping systems stable during high-pressure moments",
      B: "Improving speed and precision in delivery",
      C: "Protecting the organization from growing threats",
      D: "Aligning teams and tools across the organization",
      E: "Scaling technology to support long-term growth",
    },
  },
  {
    text: "When the pressure is highest, what role do you naturally play?",
    options: {
      A: "The last line of defense keeping everything under control",
      B: "The playmaker creating clean execution opportunities",
      C: "The defender reading threats before they develop",
      D: "The captain organizing the entire team",
      E: "The manager adjusting the long-term strategy",
    },
  },
  {
    text: "Which “match statistic” matters most to your team?",
    options: {
      A: "Fast recovery and uptime",
      B: "Release velocity and code quality",
      C: "Risk reduction and visibility",
      D: "Operational consistency across teams",
      E: "Innovation and business impact",
    },
  },
  {
    text: "What best describes your current technology environment?",
    options: {
      A: "Constant pressure from alerts and incidents",
      B: "Too many disconnected workflows slowing play down",
      C: "Defensive gaps creating security concerns",
      D: "Multiple teams operating without a shared system",
      E: "Legacy systems limiting future ambitions",
    },
  },
  {
    text: "If your organization made a major signing this season, what would the priority be?",
    options: {
      A: "Observability and resilience",
      B: "Developer efficiency and performance",
      C: "Security operations and threat detection",
      D: "Platform standardization and visibility",
      E: "AI readiness and modernization",
    },
  },
  {
    text: "How does your organization typically respond to critical incidents?",
    options: {
      A: "Immediate response with focus on stability",
      B: "Collaborative troubleshooting to solve issues quickly",
      C: "Escalation with strict risk management procedures",
      D: "Cross-functional coordination across departments",
      E: "Executive-level decision making tied to business priorities",
    },
  },
  {
    text: "What would feel like a “championship-winning season” for your organization?",
    options: {
      A: "Minimal downtime and faster recovery",
      B: "Faster releases with fewer errors",
      C: "Stronger protection against threats and risk",
      D: "Unified visibility across engineering operations",
      E: "Technology fully aligned to company growth goals",
    },
  },
];

const personas = {
  A: {
    title: "The SRE Leader",
    tagline: "Stability Under Chaos",
    role: "Elite Goalkeeper",
    description: "Calm under pressure, highly reactive, and trusted when everything is on the line.",
  },
  B: {
    title: "The Developer",
    tagline: "Precision in Execution",
    role: "Creative Midfielder",
    description: "Technical, precise, and responsible for moving the game forward efficiently.",
  },
  C: {
    title: "The CISO",
    tagline: "Risk Is the Game",
    role: "Tactical Center Back",
    description: "Reads the game early, protects the organization, and prevents dangerous attacks.",
  },
  D: {
    title: "The VP of Engineering",
    tagline: "Owning the System",
    role: "Team Captain / Box-to-Box Midfielder",
    description: "Connects the entire squad, balances operations and execution, and keeps everyone aligned.",
  },
  E: {
    title: "The CTO",
    tagline: "Vision Meets Reality",
    role: "World-Class Manager / Deep-Lying Playmaker",
    description: "Sees the full pitch, defines the strategy, and builds for long-term success.",
  },
};

const jobTitleMap = {
  "SRE Leader": "A",
  Developer: "B",
  CISO: "C",
  "VP of Engineering": "D",
  CTO: "E",
};

const pages = [
  document.querySelector("#registrationPage"),
  document.querySelector("#questionsPage"),
  document.querySelector("#personaPage"),
];
const steps = Array.from(document.querySelectorAll(".progress-step"));
const questionsContainer = document.querySelector("#questionsContainer");
const errorMessage = document.querySelector("#errorMessage");
let latestSubmission = null;

function showPage(index) {
  pages.forEach((page, pageIndex) => {
    page.classList.toggle("active", pageIndex === index);
  });

  steps.forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === index);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestions() {
  questionsContainer.innerHTML = questions
    .map((question, questionIndex) => {
      const number = questionIndex + 1;
      const options = Object.entries(question.options)
        .map(([key, value]) => {
          return `
            <label class="answer-option">
              <input class="option-inputs" type="radio" name="q${number}" value="${key}" />
              <span>${key}. ${value}</span>
            </label>
          `;
        })
        .join("");

      return `
        <article class="question-card">
          <h3>${number}. ${question.text}</h3>
          <div class="answer-list">
            ${options}
            <label class="answer-option">
              <input class="option-inputs" type="radio" name="q${number}" value="Other" />
              <span>Other</span>
            </label>
            <input class="hidden other-input" id="q${number}Other" type="text" placeholder="Enter another answer" />
          </div>
        </article>
      `;
    })
    .join("");
}



function getRegistrationData() {
  const selectedJob = document.querySelector("input[name='jobTitle']:checked");

  return {
    fullName: document.querySelector("#fullName").value.trim(),
    workEmail: document.querySelector("#workEmail").value.trim(),
    jobTitle: selectedJob ? selectedJob.value : "",
    otherJobTitle: document.querySelector("#otherJobTitle").value.trim(),
  };
}

function validateRegistration() {
  const data = getRegistrationData();
  const emailInput = document.querySelector("#workEmail");

  if (!data.fullName) {
    alert("Please enter your full name.");
    return false;
  }

  if (!emailInput.validity.valid || !data.workEmail) {
    alert("Please enter a valid work email.");
    return false;
  }

  if (!data.jobTitle) {
    alert("Please select your job title.");
    return false;
  }

  if (data.jobTitle === "Other" && !data.otherJobTitle) {
    alert("Please enter your job title.");
    return false;
  }

  return true;
}

function collectAnswers() {
  return questions.map((question, index) => {
    const number = index + 1;
    const selected = document.querySelector(`input[name='q${number}']:checked`);

    return {
      question: question.text,
      selected: selected ? selected.value : "",
      answerText: selected && selected.value !== "Other" ? question.options[selected.value] : "",
      otherText: document.querySelector(`#q${number}Other`).value.trim(),
    };
  });
}

function validateAnswers() {
  const answers = collectAnswers();

  for (let index = 0; index < answers.length; index += 1) {
    const answer = answers[index];

    if (!answer.selected) {
      errorMessage.textContent = `Please answer question ${index + 1}.`;
      return false;
    }

    if (answer.selected === "Other" && !answer.otherText) {
      errorMessage.textContent = `Please add your other answer for question ${index + 1}.`;
      return false;
    }
  }

  errorMessage.textContent = "";
  return true;
}

function calculatePersona(registration, answers) {
  const scores = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  answers.forEach((answer) => {
    if (scores[answer.selected] !== undefined) {
      scores[answer.selected] += 1;
    }
  });

  const highestScore = Math.max(...Object.values(scores));
  const winners = Object.keys(scores).filter((key) => scores[key] === highestScore);
  const jobTitlePersona = jobTitleMap[registration.jobTitle];
  return winners.includes(jobTitlePersona) ? jobTitlePersona : winners[0];
}

function showPersona(personaKey) {
  const persona = personas[personaKey];

  document.querySelector("#personaPlayerCard").textContent = persona.role;
  document.querySelector("#personaTitle").textContent = persona.title;
  document.querySelector("#personaTagline").textContent = `"${persona.tagline}"`;
  document.querySelector("#personaRole").textContent = persona.role;
  document.querySelector("#personaDescription").textContent = persona.description;
}

async function sendToGoogleSheet(data) {
  if (!GOOGLE_SCRIPT_URL) {
    return;
  }
  console.log(data)

  const formData = new FormData();

  // Registration data (using standard input names)
  formData.append("fullName", data.fullName);
  formData.append("workEmail", data.workEmail);
  formData.append("jobTitle", data.jobTitle);
  formData.append("otherJobTitle", data.otherJobTitle);
  formData.append("timestamp", data.timestamp);
  formData.append("personaTitle", data.personaTitle);
  formData.append("playerCard", data.playerCard);


  // // Registration data (using CSV Header names for compatibility)
  // formData.append("Full Name", data.fullName);
  // formData.append("Work Email", data.workEmail);
  // formData.append("Job Title", data.jobTitle);
  // formData.append("Other Job Title", data.otherJobTitle);
  // formData.append("Timestamp", data.timestamp);
  // formData.append("Persona", data.personaTitle);
  // formData.append("Player Card", data.playerCard);

  // Answers data
  data.answers.forEach((answer, index) => {
    const qNum = index + 1;
    // Input names (fallback)
    // formData.append(`q${qNum}`, answer.selected);
    // formData.append(`q${qNum}AnswerText`, answer.selected === "Other" ? answer.otherText : answer.answerText);
    // formData.append(`q${qNum}Other`, answer.otherText);

    // Full question text as the column header
    // If the user selected "Other", save what they typed. Otherwise save their standard choice.
    const finalAnswer = answer.selected === "Other" ? `F. ${answer.otherText}` : `${answer.selected}. ${answer.answerText}`;
    formData.append(answer.question, finalAnswer);
  });

  // This converts the FormData into a standard object so the console can read it
  // console.log(Object.fromEntries(formData.entries()));

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });
    console.log("Data successfully sent to Google Sheet!");
  } catch (error) {
    console.error("Error sending to Google Sheet:", error);
  }
}

renderQuestions();


document.getElementById('startBtn').addEventListener("click", e => {
  if (validateRegistration()) {
    showPage(1);
  }
})



// // const scriptURL = "https://script.google.com/a/macros/mobilise.agency/s/AKfycbx-CL-tKmQOsi8ImqBjilVRnuctxPDmHwMycEfLoIJ4Edrqyly9lB0wJQwtYsSltdE/exec"
// const scriptURL2 = "https://script.google.com/macros/s/AKfycbxzX-djo0V25-_XcAUF-BrVqWv1caqLYwHnjdyj_ErUKfvHhnl-mvFka1cUE4ovHoXV/exec"
// // const scriptURL3 = "https://script.google.com/a/macros/elastic.co/s/AKfycbypYTXJ1yX96ZYP0SHpevd8aQa-jl0_8dABirs9nY4nrATh3CSjIFO-ydVQwWp4RDrnJA/exec"
// const form = document.forms['contact-form'];
// form.addEventListener("submit", (e) => {
//   if (validateRegistration()) {
//     showPage(1);
//   }
//   e.preventDefault()
//   fetch(scriptURL2, { method: 'POST',mode: "no-cors", body: new FormData(form)})
//   .then(() => { window.alert("Form submitted sussesfully")})
//   .catch(error => console.error('Error!', error.message))
//   setTimeout(function(){
//       document.getElementById("main-form").reset();
//   },3000)

// });



document.querySelector("#backBtn").addEventListener("click", () => showPage(0));

document.querySelector("#restartBtn").addEventListener("click", () => {
  document.querySelectorAll("input").forEach((input) => {
    if (input.type === "radio") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });

  document.querySelectorAll(".other-input").forEach((input) => input.classList.add("hidden"));
  errorMessage.textContent = "";
  latestSubmission = null;
  showPage(0);
});

document.addEventListener("change", (event) => {
  if (event.target.name === "jobTitle") {
    document.querySelector("#otherJobTitle").classList.toggle("hidden", event.target.value !== "Other");
  }

  if (/^q\d+$/.test(event.target.name)) {
    const otherInput = document.querySelector(`#${event.target.name}Other`);
    otherInput.classList.toggle("hidden", event.target.value !== "Other");
  }
});

document.querySelector("#questionsForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateAnswers()) {
    return;
  }

  const registration = getRegistrationData();
  const answers = collectAnswers();
  const personaKey = calculatePersona(registration, answers);
  const persona = personas[personaKey];

  latestSubmission = {
    timestamp: new Date().toISOString(),
    ...registration,
    personaKey,
    personaTitle: `${persona.title} - ${persona.tagline}`,
    playerCard: persona.role,
    answers,
  };

  showPersona(personaKey);
  await sendToGoogleSheet(latestSubmission);
  showPage(2);
});