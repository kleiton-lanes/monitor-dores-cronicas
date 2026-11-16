import { db } from "./firebase-config.js";
import { aoAtualizarPacientes } from "./pacientes.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, orderBy, query,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const colecao = collection(db, "registros");
let registrosCache = [];

function preencherSelectPacientes(select, pacientes, valorAtual) {
  const selecionado = valorAtual ?? select.value;
  select.innerHTML = '<option value="">Selecione o paciente</option>';
  pacientes.forEach((paciente) => {
    const opcao = document.createElement("option");
    opcao.value = paciente.id;
    opcao.textContent = paciente.nome;
    select.appendChild(opcao);
  });
  if (selecionado) select.value = selecionado;
}

export function initRegistros() {
  const form = document.getElementById("form-registro");
  const idInput = document.getElementById("registro-id");
  const pacienteSelect = document.getElementById("registro-paciente");
  const dataInput = document.getElementById("registro-data");
  const localSelect = document.getElementById("registro-local");
  const intensidadeInput = document.getElementById("registro-intensidade");
  const intensidadeValor = document.getElementById("registro-intensidade-valor");
  const gatilhoInput = document.getElementById("registro-gatilho");
  const sintomasInput = document.getElementById("registro-sintomas");
  const botaoCancelar = document.getElementById("registro-cancelar");
  const lista = document.getElementById("lista-registros");

  aoAtualizarPacientes((pacientes) => preencherSelectPacientes(pacienteSelect, pacientes));

  intensidadeInput.addEventListener("input", () => {
    intensidadeValor.textContent = intensidadeInput.value;
  });

  function limparFormulario() {
    form.reset();
    idInput.value = "";
    intensidadeValor.textContent = "5";
    botaoCancelar.hidden = true;
  }

  botaoCancelar.addEventListener("click", limparFormulario);

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const pacienteSelecionado = pacienteSelect.options[pacienteSelect.selectedIndex];
    const dados = {
      pacienteId: pacienteSelect.value,
      pacienteNome: pacienteSelecionado ? pacienteSelecionado.textContent : "",
      data: dataInput.value,
      local: localSelect.value,
      intensidade: Number(intensidadeInput.value),
      gatilho: gatilhoInput.value.trim(),
      sintomas: sintomasInput.value.trim(),
    };

    if (idInput.value) {
      await updateDoc(doc(db, "registros", idInput.value), dados);
    } else {
      await addDoc(colecao, { ...dados, criadoEm: serverTimestamp() });
    }
    limparFormulario();
  });

  const consulta = query(colecao, orderBy("data", "desc"));
  onSnapshot(consulta, (snapshot) => {
    registrosCache = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    lista.innerHTML = "";
    registrosCache.forEach((registro) => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${registro.pacienteNome}</td>
        <td>${registro.data}</td>
        <td>${registro.local}</td>
        <td>${registro.intensidade}</td>
        <td>${registro.gatilho || ""}</td>
        <td>
          <button type="button" data-acao="editar" data-id="${registro.id}">Editar</button>
          <button type="button" class="perigo" data-acao="excluir" data-id="${registro.id}">Excluir</button>
        </td>`;
      lista.appendChild(linha);
    });
  });

  lista.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;
    const registro = registrosCache.find((r) => r.id === botao.dataset.id);
    if (!registro) return;

    if (botao.dataset.acao === "editar") {
      idInput.value = registro.id;
      pacienteSelect.value = registro.pacienteId;
      dataInput.value = registro.data;
      localSelect.value = registro.local;
      intensidadeInput.value = registro.intensidade;
      intensidadeValor.textContent = registro.intensidade;
      gatilhoInput.value = registro.gatilho || "";
      sintomasInput.value = registro.sintomas || "";
      botaoCancelar.hidden = false;
    } else if (botao.dataset.acao === "excluir") {
      if (confirm("Excluir este registro de dor?")) {
        await deleteDoc(doc(db, "registros", registro.id));
      }
    }
  });
}
