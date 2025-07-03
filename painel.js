import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

import {
  getAuth,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

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

const setoresFixos = [
  "Convidados",
  "AD Sede",
  "AD Planalto",
  "AD Icarai",
  "AD Metropolitano",
  "AD Quintino Cunha",
  "AD Arianopolis",
  "AD Tanupaba"
];

async function carregarTodosInscritosPorSetor() {
  const resultado = {};
  for (const setor of setoresFixos) {
    const inscritosRef = collection(db, "cadastros", setor, "inscritos");
    const snapshot = await getDocs(inscritosRef);
    resultado[setor] = snapshot.docs.map(doc => doc.data());
  }
  return resultado;
}

async function gerarPDF() {
  const filtroSelecionado = document.getElementById("setorSelect").value;
  const dadosPorSetor = await carregarTodosInscritosPorSetor();

  const conteudo = [];
  let contadorGlobal = 0;

  conteudo.push({
    text: "Relatório de Inscritos - JUVA",
    style: "header",
    margin: [0, 0, 0, 10]
  });

  const setoresParaExibir = filtroSelecionado
    ? [filtroSelecionado]
    : Object.keys(dadosPorSetor);

  let totalInscritos = 0;
  setoresParaExibir.forEach(setor => {
    totalInscritos += dadosPorSetor[setor]?.length || 0;
  });

  conteudo.push({
    text: `Total de inscritos: ${totalInscritos}`,
    style: "subheader",
    margin: [0, 0, 0, 20]
  });

  setoresParaExibir.forEach(setor => {
    const inscritos = dadosPorSetor[setor] || [];
    if (inscritos.length > 0) {
      conteudo.push({
        text: `Setor: ${setor}`,
        style: "setor",
        margin: [0, 10, 0, 10]
      });

      // ✅ Líderes ordenados por nome, depois os demais também
      const lideres = inscritos
        .filter(p => p.lider_juventude === "sim")
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

      const outros = inscritos
        .filter(p => p.lider_juventude !== "sim")
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

      const ordenados = [...lideres, ...outros];

      ordenados.forEach(inscrito => {
        const bloco = [
          ...(inscrito.lider_juventude === "sim"
            ? [
                { text: "Líder", color: "#ff6f61", fontSize: 9, margin: [0, 0, 0, 2] },
                { text: `Nome: ${inscrito.nome || "-"}`, margin: [0, 1] }
              ]
            : [
                { text: `Nome: ${inscrito.nome || "-"}`, margin: [0, 1] }
              ]),
          { text: `Idade: ${inscrito.idade || "-"}`, margin: [0, 1] },
          { text: `Pai: ${inscrito.nome_pai || "-"}`, margin: [0, 1] },
          { text: `Mãe: ${inscrito.nome_mae || "-"}`, margin: [0, 1] },
          { text: `Email: ${inscrito.email || "-"}`, margin: [0, 1] },
          { text: `WhatsApp: ${inscrito.contato || "-"}`, margin: [0, 1] },
          { text: `Emergência: ${inscrito.contato_emergencia || "-"}`, margin: [0, 1] },
          { text: `Endereço: ${inscrito.endereco || "-"}`, margin: [0, 1] },
          { text: `Alergias: ${inscrito.alergias || "-"}`, margin: [0, 1] },
          { text: `Convidado por: ${inscrito.quemConvidou || "-"}`, margin: [0, 1] },
          { text: `Contato do Convidador: ${inscrito.contatoConvidador || "-"}`, margin: [0, 1] },
          { text: `Congregação: ${inscrito.Congregacao || inscrito.congregacao || "-"}`, margin: [0, 1] },
          {
            text: `Assinatura: ___________________________________________`,
            margin: [0, 6]
          },
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 530, y2: 0, lineWidth: 0.5 }],
            margin: [0, 6, 0, 6]
          }
        ];

        const ficha = {
          stack: bloco,
          margin: [0, 0, 0, 4],
          pageBreak: (++contadorGlobal % 3 === 0) ? 'after' : ''
        };

        conteudo.push(ficha);
      });
    }
  });

  if (filtroSelecionado) {
    conteudo.push({
      text: "\n\nAssinatura do Líder: ___________________________________________",
      style: "assinaturaLider",
      margin: [0, 30, 0, 0]
    });
  }

  const docDefinition = {
    content: conteudo,
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: "center"
      },
      subheader: {
        fontSize: 12,
        alignment: "center",
        color: "#444"
      },
      setor: {
        fontSize: 14,
        bold: true,
        color: "#3420eb"
      },
      assinaturaLider: {
        fontSize: 12,
        alignment: "left",
        italics: true
      }
    },
    defaultStyle: {
      fontSize: 8
    },
    pageMargins: [30, 40, 30, 40],
    pageOrientation: "portrait",

    footer: function (currentPage, pageCount) {
      const setorNome = filtroSelecionado
        ? filtroSelecionado.toUpperCase()
        : "GERAL";
      return {
        text: `JUVA SUNSET - ${setorNome} - P${currentPage}`,
        alignment: 'right',
        margin: [0, 0, 30, 10],
        fontSize: 9,
        color: "#888"
      };
    }
  };

  pdfMake.createPdf(docDefinition).download("relatorio_juva_ficha.pdf");
}

function logout() {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      window.location.href = "admin.html";
    })
    .catch((error) => {
      console.error("Erro ao sair:", error);
    });
}

window.voltarParaCadastro = function () {
  window.location.href = "index.html";
};

window.gerarPDF = gerarPDF;
window.logout = logout;
