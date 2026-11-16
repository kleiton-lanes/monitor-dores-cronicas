import { db } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const colecao = collection(db, "medicos");
let medicosCache = [];
const ouvintes = [];

export function aoAtualizarMedicos(callback) {
  ouvintes.push(callback);
  callback(medicosCache);
}

function notificarOuvintes() {
  ouvintes.forEach((cb) => cb(medicosCache));
}

export function initMedicos() {
  const form = document.getElementById("form-medico");
  const idInput = document.getElementById("medico-id");
  const nomeInput = document.getElementById("medico-nome");
  const crmInput = document.getElementById("medico-crm");
  const especialidadeInput = document.getElementById("medico-especialidade");
  const botaoCancelar = document.getElementById("medico-cancelar");
  const lista = document.getElementById("lista-medicos");

  function limparFormulario() {
    form.reset();
    idInput.value = "";
    botaoCancelar.hidden = true;
  }

  botaoCancelar.addEventListener("click", limparFormulario);

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const dados = {
      nome: nomeInput.value.trim(),
      crm: crmInput.value.trim(),
      especialidade: especialidadeInput.value.trim(),
    };

    if (idInput.value) {
      await updateDoc(doc(db, "medicos", idInput.value), dados);
    } else {
      await addDoc(colecao, { ...dados, criadoEm: serverTimestamp() });
    }
    limparFormulario();
  });

  onSnapshot(colecao, (snapshot) => {
    medicosCache = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    notificarOuvintes();

    lista.innerHTML = "";
    medicosCache.forEach((medico) => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${medico.nome}</td>
        <td>${medico.crm}</td>
        <td>${medico.especialidade || ""}</td>
        <td>
          <button type="button" data-acao="editar" data-id="${medico.id}">Editar</button>
          <button type="button" class="perigo" data-acao="excluir" data-id="${medico.id}">Excluir</button>
        </td>`;
      lista.appendChild(linha);
    });
  });

  lista.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;
    const medico = medicosCache.find((m) => m.id === botao.dataset.id);
    if (!medico) return;

    if (botao.dataset.acao === "editar") {
      idInput.value = medico.id;
      nomeInput.value = medico.nome;
      crmInput.value = medico.crm;
      especialidadeInput.value = medico.especialidade || "";
      botaoCancelar.hidden = false;
    } else if (botao.dataset.acao === "excluir") {
      if (confirm(`Excluir o médico "${medico.nome}"?`)) {
        await deleteDoc(doc(db, "medicos", medico.id));
      }
    }
  });
}
