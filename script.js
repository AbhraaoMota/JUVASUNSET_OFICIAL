import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// 🔧 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCFzOB4EDaNrdEIcg_NVixSU_Y0tOmf8JM",
  authDomain: "juva-web.firebaseapp.com",
  projectId: "juva-web",
  storageBucket: "juva-web.firebasestorage.app",
  messagingSenderId: "271062195107",
  appId: "1:271062195107:web:40e8b35d9ad786b245d816"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

// ✅ Nova função de verificação da idade com campo único
function verificarObrigatoriedadeIdade() {
  const dataInput = document.getElementById('dataNascimento');
  const nascimentoStr = dataInput?.value;
  if (!nascimentoStr) return;

  const nascimento = new Date(nascimentoStr);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;

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

const dataInput = document.getElementById("dataNascimento");
if (dataInput) {
  dataInput.addEventListener("input", verificarObrigatoriedadeIdade);
}

window.respostaConvidado = function(ehConvidado) {
  document.getElementById('passo1').style.display = 'none';
  if (ehConvidado) {
    document.getElementById('convidadoExtra').style.display = 'block';
  } else {
    document.getElementById('passo2').style.display = 'block';
  }
};

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
      localStorage.setItem('docIdCadastro', docId);
      localStorage.setItem('setorCadastro', setor);

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

window.voltarParaFormulario = function () {
  document.getElementById('cadastroForm').style.display = 'none';
  document.getElementById('camposExtrasMembro').style.display = 'none';
  document.getElementById('convidadoExtra').style.display = 'none';
  document.getElementById('passo2').style.display = 'none';
  document.getElementById('passo1').style.display = 'block';
};

// ✅ Editar cadastro
window.editarCadastro = async function () {
  const docId = localStorage.getItem("docIdCadastro");
  const setor = localStorage.getItem("setorCadastro");

  if (!docId || !setor) return alert("Nenhum cadastro anterior encontrado.");

  try {
    const ref = doc(db, "cadastros", setor, "inscritos", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return alert("Cadastro não encontrado.");

    const dados = snap.data();
    const form = document.getElementById("cadastroForm");
    const camposExtras = document.getElementById("camposExtrasMembro");
    const convidadoExtra = document.getElementById("convidadoExtra");

    for (const key in dados) {
      const campo = document.querySelector(`[name="${key}"]`);
      if (campo) campo.value = dados[key];
    }

    document.getElementById("idade").value = dados.idade || "";

    if (dados.quemConvidou) {
      convidadoExtra.style.display = "block";
      camposExtras.style.display = "none";
      document.getElementById("quemConvidou").value = dados.quemConvidou || "";
      document.getElementById("contatoConvidador").value = dados.contatoConvidador || "";
      document.getElementById("setorConvidador").value = dados.Congregacao || "";
    } else {
      convidadoExtra.style.display = "none";
      camposExtras.style.display = "block";
      document.getElementById("selectCongregacao").value = dados.Congregacao || "";
    }

    document.getElementById("lider_juventude").checked = dados.lider_juventude === "sim";
    document.getElementById("mensagemMembro").style.display = "none";
    document.getElementById("mensagemConvidado").style.display = "none";
    form.style.display = "block";

    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (err) {
    alert("Erro ao buscar dados: " + err.message);
    console.error(err);
  }
};

// ✅ Excluir cadastro
window.excluirCadastro = async function () {
  const docId = localStorage.getItem("docIdCadastro");
  const setor = localStorage.getItem("setorCadastro");

  if (!docId || !setor) return alert("Cadastro anterior não encontrado.");

  if (!confirm("Tem certeza que deseja excluir seu cadastro? Esta ação é irreversível.")) return;

  try {
    const ref = doc(db, "cadastros", setor, "inscritos", docId);
    await deleteDoc(ref);

    localStorage.clear();
    alert("Cadastro excluído com sucesso.");
    location.reload();
  } catch (err) {
    alert("Erro ao excluir cadastro: " + err.message);
    console.error(err);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  const elem = document.getElementById('dataNascimento');
  if (elem) {
    const datepicker = new Datepicker(elem, {
      autohide: true,
      format: 'yyyy-mm-dd',
      maxDate: new Date()
    });

    elem.addEventListener("changeDate", verificarObrigatoriedadeIdade);
  }
});
