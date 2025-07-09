// painel.js atualizado com novo estilo visual no PDF (modelo aprovado)

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

  let totalLideres = 0;
  let totalJovens = 0;
  let totalConvidados = 0;

  setoresParaExibir.forEach(setor => {
    const lista = dadosPorSetor[setor] || [];
    lista.forEach(p => {
      const ehLider = p.lider_juventude === "sim";
      const ehConvidado = setor === "Convidados";

      if (ehConvidado) totalConvidados++;
      else if (ehLider) totalLideres++;
      else totalJovens++;
    });
  });

  conteudo.push({
    text: `Total de Jovens: ${totalJovens} / 70\nLíderes: ${totalLideres} • Convidados: ${totalConvidados}`,
    style: "subheader",
    margin: [0, 0, 0, 20]
  });

  const mapaDuplicados = new Map();
  Object.values(dadosPorSetor).flat().forEach(p => {
    const chave = `${p.nome?.trim().toLowerCase()}_${p.contato?.trim()}`;
    mapaDuplicados.set(chave, (mapaDuplicados.get(chave) || 0) + 1);
  });

  setoresParaExibir.forEach(setor => {
    const inscritos = dadosPorSetor[setor] || [];
    if (inscritos.length > 0) {
      conteudo.push({
        text: `Setor: ${setor}`,
        style: "setor",
        margin: [0, 10, 0, 10]
      });

      const lideres = inscritos.filter(p => p.lider_juventude === "sim");
      const outros = inscritos.filter(p => p.lider_juventude !== "sim");
      const ordenados = [...lideres, ...outros];

      ordenados.forEach(inscrito => {
        const chave = `${inscrito.nome?.trim().toLowerCase()}_${inscrito.contato?.trim()}`;
        const isDuplicado = mapaDuplicados.get(chave) > 1;

        contadorGlobal++;
        let pageBreak = "";
        if (contadorGlobal <= 3 && contadorGlobal % 3 === 0) pageBreak = "after";
        else if (contadorGlobal > 3 && (contadorGlobal - 3) % 4 === 0) pageBreak = "after";

        const ficha = {
          margin: [0, 0, 0, 10],
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  { text: inscrito.nome || "-", style: "nomePrincipal" },
                  {
                    columns: [
                      (inscrito.lider_juventude === "sim") ? { text: "LÍDER", style: "badgeLider" } : {},
                      isDuplicado ? { text: "DUPLICADO", style: "badgeDuplicado" } : {},
                      setor === "Convidados" ? { text: "CONVIDADO", style: "badgeConvidado" } : {}
                    ].filter(e => Object.keys(e).length > 0)
                  },
                  {
                    columns: [
                      { text: `Idade: ${inscrito.idade || "-"}`, width: "50%" },
                      { text: `WhatsApp: ${inscrito.contato || "-"}`, width: "50%" }
                    ], margin: [0, 5]
                  },
                  { columns: [
                    { text: `Pai: ${inscrito.nome_pai || "-"}`, width: "50%" },
                    { text: `Mãe: ${inscrito.nome_mae || "-"}`, width: "50%" }
                  ]},
                  { text: `Email: ${inscrito.email || "-"}`, margin: [0, 5, 0, 0] },
                  { text: `Endereço: ${inscrito.endereco || "-"}` },
                  { text: `Emergência: ${inscrito.contato_emergencia || "-"}` },
                  { text: `Alergias: ${inscrito.alergias || "-"}` },
                  { text: `Convidado por: ${inscrito.quemConvidou || "-"}` },
                  { text: `Contato do Convidador: ${inscrito.contatoConvidador || "-"}` },
                  { text: `Congregação: ${inscrito.Congregacao || "-"}` },
                  { text: "Assinatura: _____________________________________________________________________________", margin: [0, 10, 0, 0] }
                ],
                fillColor: "#f8f8f8",
                margin: [10, 6, 10, 6]
              }
            ]]
          },
          layout: "noBorders",
          pageBreak
        };

        conteudo.push(ficha);
      });
    }
  });

  const docDefinition = {
    content: conteudo,
    styles: {
      header: { fontSize: 18, bold: true, alignment: "center" },
      subheader: { fontSize: 12, alignment: "center", color: "#444" },
      setor: { fontSize: 14, bold: true, color: "#3420eb" },
      assinaturaLider: { fontSize: 12, alignment: "left", italics: true },
      nomePrincipal: { fontSize: 14, bold: true, alignment: "center", margin: [0, 0, 0, 5] },
      badgeLider: { fontSize: 9, color: "#fff", background: "#ff6f61", bold: true, margin: [2, 2, 2, 2], alignment: "center" },
      badgeDuplicado: { fontSize: 9, color: "#fff", background: "#c0392b", bold: true, margin: [2, 2, 2, 2], alignment: "center" },
      badgeConvidado: { fontSize: 9, color: "#fff", background: "#2980b9", bold: true, margin: [2, 2, 2, 2], alignment: "center" }
    },
    defaultStyle: { fontSize: 8 },
    pageMargins: [30, 40, 30, 40],
    pageOrientation: "portrait",
    footer: function (currentPage, pageCount) {
      const setorNome = filtroSelecionado ? filtroSelecionado.toUpperCase() : "GERAL";
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
    .then(() => { window.location.href = "admin.html"; })
    .catch((error) => { console.error("Erro ao sair:", error); });
}

window.voltarParaCadastro = function () {
  window.location.href = "index.html";
};

window.gerarPDF = gerarPDF;
window.logout = logout;
