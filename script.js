import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// 🔧 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCFzOB4EDaNrdEIcg_NVixSU_Y0tOmf8JM",
  authDomain: "juva-web.firebaseapp.com",
  projectId: "juva-web",
  storageBucket: "juva-web.firebasestorage.app",
  messagingSenderId: "271062195107",
  appId: "1:271062195107:web:40e8b35d9ad786b245d816",
  measurementId: "G-64BMKWS4LL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Armazena conteúdo original das mensagens
let originalMensagemMembro = "";
let originalMensagemConvidado = "";

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('cadastroForm');
  if (!form) return;

  ['contato', 'contato_emergencia', 'contatoConvidador'].forEach(id => {
    const input = document.getElementById(id);
    if (input) aplicarMascaraTelefone(input);
  });

  const mMembro = document.getElementById('mensagemMembro');
  const mConvidado = document.getElementById('mensagemConvidado');
  if (mMembro) originalMensagemMembro = mMembro.innerHTML;
  if (mConvidado) originalMensagemConvidado = mConvidado.innerHTML;

  const cadastroFeito = localStorage.getItem('cadastroConcluido');
  const nomeSalvo = localStorage.getItem('nomeCadastrado');
  const ehConvidado = localStorage.getItem('ehConvidado') === 'true';

  if (cadastroFeito && nomeSalvo) {
    const saudacaoHTML = `<h2 style="color: green;">✅ Cadastro Concluído!</h2><br><h3>Olá, ${nomeSalvo}!</h3><br>`;

    if (ehConvidado) {
      mConvidado.innerHTML = saudacaoHTML + originalMensagemConvidado;
      mConvidado.style.display = 'block';
    } else {
      mMembro.innerHTML = saudacaoHTML + originalMensagemMembro;
      mMembro.style.display = 'block';
    }

    document.getElementById('passo1').style.display = 'none';
    document.getElementById('passo2').style.display = 'none';
    document.getElementById('cadastroForm').style.display = 'none';
    document.getElementById('camposExtrasMembro').style.display = 'none';
    document.getElementById('convidadoExtra').style.display = 'none';
  }
});

// ✅ Aplica máscara de telefone
function aplicarMascaraTelefone(input) {
  input.addEventListener('input', () => {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length >= 2 && valor.length <= 6) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else if (valor.length > 6 && valor.length <= 10) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`;
    } else if (valor.length === 11) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
    }

    input.value = valor;
  });
}

// ✅ Cálculo de idade
function calcularIdade(dia, mes, ano) {
  const hoje = new Date();
  const nascimento = new Date(ano, mes - 1, dia);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  if (
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }
  return idade;
}

// ✅ Valida obrigatoriedade dos pais e altera placeholders
function verificarObrigatoriedadeIdade() {
  const dia = parseInt(document.getElementById('diaNascimento')?.value);
  const mes = parseInt(document.getElementById('mesNascimento')?.value);
  const ano = parseInt(document.getElementById('anoNascimento')?.value);
  if (!dia || !mes || !ano) return;

  const idade = calcularIdade(dia, mes, ano);
  const idadeInput = document.getElementById('idade');
  if (idadeInput) idadeInput.value = idade;

  const nomePai = document.getElementById('nome_pai');
  const nomeMae = document.getElementById('nome_mae');

  if (idade < 18) {
    if (nomePai) {
      nomePai.required = true;
      nomePai.style.borderColor = "red";
      nomePai.placeholder = "Nome do Pai (Obrigatório)";
    }
    if (nomeMae) {
      nomeMae.required = true;
      nomeMae.style.borderColor = "red";
      nomeMae.placeholder = "Nome da Mãe (Obrigatório)";
    }
  } else {
    if (nomePai) {
      nomePai.required = false;
      nomePai.style.borderColor = "";
      nomePai.placeholder = "Nome do Pai (Opcional)";
    }
    if (nomeMae) {
      nomeMae.required = false;
      nomeMae.style.borderColor = "";
      nomeMae.placeholder = "Nome da Mãe (Opcional)";
    }
  }
}

["diaNascimento", "mesNascimento", "anoNascimento"].forEach(id => {
  const campo = document.getElementById(id);
  if (campo) campo.addEventListener("input", verificarObrigatoriedadeIdade);
});

// ✅ Resposta inicial do usuário
window.respostaConvidado = function(ehConvidado) {
  document.getElementById('passo1').style.display = 'none';
  if (ehConvidado) {
    document.getElementById('convidadoExtra').style.display = 'block';
  } else {
    document.getElementById('passo2').style.display = 'block';
  }
};

// ✅ Continua cadastro de convidado
window.continuarCadastroConvidado = function () {
  const quem = document.getElementById('quemConvidou')?.value.trim();
  const contato = document.getElementById('contatoConvidador')?.value.trim();
  const setor = document.getElementById('setorConvidador')?.value;

  if (!quem || !contato || !setor) {
    return alert("Preencha todos os dados!");
  }

  document.getElementById('hiddenCongregacao').value = setor;

  const quemInput = document.createElement('input');
  quemInput.type = "hidden";
  quemInput.name = "quemConvidou";
  quemInput.value = quem;

  const contatoInput = document.createElement('input');
  contatoInput.type = "hidden";
  contatoInput.name = "contatoConvidador";
  contatoInput.value = contato;

  const form = document.getElementById('cadastroForm');
  if (form) {
    form.appendChild(quemInput);
    form.appendChild(contatoInput);
    document.getElementById('camposExtrasMembro').style.display = 'none';
    document.getElementById('convidadoExtra').style.display = 'none';
    form.style.display = 'block';
  }
};

// ✅ Avança para formulário de membro
window.avancarParaFormulario = function () {
  const sel = document.getElementById('selectCongregacao');
  if (!sel.value) return alert("Selecione a congregação!");
  document.getElementById('hiddenCongregacao').value = sel.value;
  document.getElementById('passo2').style.display = 'none';
  document.getElementById('camposExtrasMembro').style.display = 'block';
  document.getElementById('cadastroForm').style.display = 'block';
};

// ✅ Envio do formulário
const form = document.getElementById('cadastroForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idade = parseInt(document.getElementById('idade')?.value || "0");
    const formData = new FormData(form);

    const lider = document.getElementById('lider_juventude');
    formData.set("lider_juventude", lider?.checked ? "sim" : "não");

    const dados = Object.fromEntries(formData.entries());
    const isConvidado = dados.quemConvidou || dados.contatoConvidador;
    const setor = isConvidado ? "Convidados" : (dados.Congregacao || "Indefinido");

    if (!dados.nome || !dados.contato) {
      return alert("Preencha nome e número corretamente.");
    }

    if (!isConvidado && idade < 18 && (!dados.nome_pai || !dados.nome_mae)) {
      return alert("Informe o nome do pai e da mãe para menores de idade.");
    }

    try {
      const docId = `${dados.nome}_${dados.contato}`;
      const docRef = doc(db, "cadastros", setor, "inscritos", docId);
      await setDoc(docRef, dados);

      form.reset();
      form.style.display = 'none';

      const nome = dados.nome || "";

      localStorage.setItem('cadastroConcluido', 'true');
      localStorage.setItem('ehConvidado', isConvidado ? 'true' : 'false');
      localStorage.setItem('nomeCadastrado', nome);

      const saudacaoHTML = `<h2 style="color: green;">✅ Cadastro Concluído!</h2><br><h3>Olá, ${nome}!</h3><br>`;
      const mensagemMembro = document.getElementById('mensagemMembro');
      const mensagemConvidado = document.getElementById('mensagemConvidado');

      if (isConvidado) {
        mensagemConvidado.innerHTML = saudacaoHTML + originalMensagemConvidado;
        mensagemConvidado.style.display = 'block';
      } else {
        mensagemMembro.innerHTML = saudacaoHTML + originalMensagemMembro;
        mensagemMembro.style.display = 'block';
      }

    } catch (err) {
      alert("Erro ao salvar no Firebase: " + err.message);
      console.error("❌ Erro ao salvar:", err);
    }
  });
}

// ✅ Novo cadastro
window.novoCadastro = function () {
  const m1 = document.getElementById('mensagemConvidado');
  const m2 = document.getElementById('mensagemMembro');

  if (m1) m1.style.display = 'none';
  if (m2) m2.style.display = 'none';

  document.getElementById('passo1').style.display = 'block';
  document.getElementById('passo2').style.display = 'none';
  document.getElementById('cadastroForm').style.display = 'none';
  document.getElementById('camposExtrasMembro').style.display = 'none';
  document.getElementById('convidadoExtra').style.display = 'none';
  document.getElementById('cadastroForm').reset();
};

// ✅ Botão "Voltar"
window.voltarParaFormulario = function () {
  document.getElementById('cadastroForm').style.display = 'none';
  document.getElementById('camposExtrasMembro').style.display = 'none';
  document.getElementById('convidadoExtra').style.display = 'none';
  document.getElementById('passo2').style.display = 'none';
  document.getElementById('passo1').style.display = 'block';
};
