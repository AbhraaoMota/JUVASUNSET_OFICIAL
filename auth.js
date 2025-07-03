import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCFzOB4EDaNrdEIcg_NVixSU_Y0tOmf8JM",
  authDomain: "juva-web.firebaseapp.com",
  projectId: "juva-web",
  storageBucket: "juva-web.firebasestorage.app",
  messagingSenderId: "271062195107",
  appId: "1:271062195107:web:40e8b35d9ad786b245d816"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login com e-mail/senha
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "painel.html";
  } catch (err) {
    alert("Email ou senha inválidos.");
    console.error("Erro ao logar:", err);
  }
});

// ✅ Voltar para a página de cadastro
window.voltarParaCadastro = function () {
  window.location.href = "index.html";
};
