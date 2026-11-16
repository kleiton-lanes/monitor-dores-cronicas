import { db } from "./firebase-config.js";
import { aoAtualizarMedicos } from "./medicos.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const colecao = collection(db, "pacientes");

let pacientesCache = [];
const ouvintes = [];

export function aoAtualizarPacientes(callback) {
  ouvintes.push(callback);
  callback(pacientesCache);
}

function notificarOuvintes() {
  ouvintes.forEach((cb) => cb(pacientesCache));
}

export function initPacientes() {
  const form = document.getElementById("form-paciente");
  const idInput = document.getElementById("paciente-id");
  const nomeInput = document.getElementById("paciente-nome");
  const idadeInput = document.getElementById("paciente-idade");
  const condicoesInput = document.getElementById("paciente-condicoes");
  const medicoSelect = document.getElementById("paciente-medico");
  const observacoesInput = document.getElementById("paciente-observacoes");
  const botaoCancelar = document.getElementById("paciente-cancelar");
  const lista = document.getElementById("lista-pacientes");

  aoAtualizarMedicos((medicos) => {
    const selecionado = medicoSelect.value;
    medicoSelect.innerHTML = '<option value="">Médico responsável (opcional)</option>';
    medicos.forEach((medico) => {
      const opcao = document.createElement("option");
      opcao.value = medico.id;
      opcao.textContent = medico.nome;
      medicoSelect.appendChild(opcao);
    });
    if (selecionado) medicoSelect.value = selecionado;
  });

  function limparFormulario() {
    form.reset();
    idInput.value = "";
    botaoCancelar.hidden = true;
  }

  botaoCancelar.addEventListener("click", limparFormulario);

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const medicoSelecionado = medicoSelect.options[medicoSelect.selectedIndex];
    const dados = {
      nome: nomeInput.value.trim(),
      idade: Number(idadeInput.value),
      condicoes: condicoesInput.value.trim(),
      observacoes: observacoesInput.value.trim(),
      medicoId: medicoSelect.value || "",
      medicoNome: medicoSelect.value ? medicoSelecionado.textContent : "",
    };

    if (idInput.value) {
      await updateDoc(doc(db, "pacientes", idInput.value), dados);
    } else {
      await addDoc(colecao, { ...dados, criadoEm: serverTimestamp() });
    }
    limparFormulario();
  });

  onSnapshot(colecao, (snapshot) => {
    pacientesCache = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    notificarOuvintes();

    lista.innerHTML = "";
    pacientesCache.forEach((paciente) => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${paciente.nome}</td>
        <td>${paciente.idade}</td>
        <td>${paciente.condicoes || ""}</td>
        <td>${paciente.medicoNome || ""}</td>
        <td>
          <button type="button" data-acao="editar" data-id="${paciente.id}">Editar</button>
          <button type="button" class="perigo" data-acao="excluir" data-id="${paciente.id}">Excluir</button>
        </td>`;
      lista.appendChild(linha);
    });
  });

  lista.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;
    const paciente = pacientesCache.find((p) => p.id === botao.dataset.id);
    if (!paciente) return;

    if (botao.dataset.acao === "editar") {
      idInput.value = paciente.id;
      nomeInput.value = paciente.nome;
      idadeInput.value = paciente.idade;
      condicoesInput.value = paciente.condicoes || "";
      medicoSelect.value = paciente.medicoId || "";
      observacoesInput.value = paciente.observacoes || "";
      botaoCancelar.hidden = false;
    } else if (botao.dataset.acao === "excluir") {
      if (confirm(`Excluir o paciente "${paciente.nome}"? Isso não apaga os registros de dor já salvos.`)) {
        await deleteDoc(doc(db, "pacientes", paciente.id));
      }
    }
  });
}
