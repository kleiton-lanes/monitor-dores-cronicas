import { db } from "./firebase-config.js";
import { aoAtualizarPacientes } from "./pacientes.js";
import { aoAtualizarMedicos } from "./medicos.js";
import {
  collection, query, orderBy, onSnapshot,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const colecao = collection(db, "registros");
let registrosCache = [];
let pacientesCache = [];

function preencherSelect(select, itens, placeholder) {
  const selecionado = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>`;
  itens.forEach((item) => {
    const opcao = document.createElement("option");
    opcao.value = item.id;
    opcao.textContent = item.nome;
    select.appendChild(opcao);
  });
  if (selecionado) select.value = selecionado;
}

function montarResumo(registros) {
  if (registros.length === 0) {
    return "<p>Nenhum registro encontrado para os filtros selecionados.</p>";
  }

  const intensidades = registros.map((r) => r.intensidade);
  const media = intensidades.reduce((soma, valor) => soma + valor, 0) / intensidades.length;
  const maxima = Math.max(...intensidades);
  const pacientesUnicos = new Set(registros.map((r) => r.pacienteId)).size;
  const alertas = registros.filter((r) => r.intensidade >= 7).length;

  let html = `
    <p><strong>Pacientes no filtro:</strong> ${pacientesUnicos}</p>
    <p><strong>Total de registros:</strong> ${registros.length}</p>
    <p><strong>Intensidade média:</strong> ${media.toFixed(1)} / 10</p>
    <p><strong>Intensidade máxima:</strong> ${maxima} / 10</p>
  `;

  if (alertas > 0) {
    html += `<p class="alerta">⚠ ${alertas} registro(s) com intensidade ≥ 7. Considere agendar consulta.</p>`;
  }

  return html;
}

export function initRelatorios() {
  const pacienteSelect = document.getElementById("relatorio-paciente");
  const medicoSelect = document.getElementById("relatorio-medico");
  const dataInicioInput = document.getElementById("relatorio-data-inicio");
  const dataFimInput = document.getElementById("relatorio-data-fim");
  const botaoLimpar = document.getElementById("relatorio-limpar");
  const resumo = document.getElementById("relatorio-resumo");
  const tabela = document.getElementById("relatorio-tabela");

  function pacienteCombinaComMedico(pacienteId, medicoId) {
    if (!medicoId) return true;
    const paciente = pacientesCache.find((p) => p.id === pacienteId);
    return paciente ? paciente.medicoId === medicoId : false;
  }

  function aplicarFiltros() {
    const pacienteId = pacienteSelect.value;
    const medicoId = medicoSelect.value;
    const dataInicio = dataInicioInput.value;
    const dataFim = dataFimInput.value;

    const filtrados = registrosCache.filter((registro) => {
      if (pacienteId && registro.pacienteId !== pacienteId) return false;
      if (!pacienteCombinaComMedico(registro.pacienteId, medicoId)) return false;
      if (dataInicio && registro.data < dataInicio) return false;
      if (dataFim && registro.data > dataFim) return false;
      return true;
    });

    resumo.innerHTML = montarResumo(filtrados);

    tabela.innerHTML = "";
    filtrados.forEach((registro) => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${registro.pacienteNome}</td>
        <td>${registro.data}</td>
        <td>${registro.local}</td>
        <td>${registro.intensidade}</td>
        <td>${registro.gatilho || ""}</td>
        <td>${registro.sintomas || ""}</td>`;
      tabela.appendChild(linha);
    });
  }

  aoAtualizarPacientes((pacientes) => {
    pacientesCache = pacientes;
    preencherSelect(pacienteSelect, pacientes, "Todos os pacientes");
    aplicarFiltros();
  });

  aoAtualizarMedicos((medicos) => {
    preencherSelect(medicoSelect, medicos, "Todos os médicos");
    aplicarFiltros();
  });

  [pacienteSelect, medicoSelect, dataInicioInput, dataFimInput].forEach((campo) => {
    campo.addEventListener("change", aplicarFiltros);
  });

  botaoLimpar.addEventListener("click", () => {
    pacienteSelect.value = "";
    medicoSelect.value = "";
    dataInicioInput.value = "";
    dataFimInput.value = "";
    aplicarFiltros();
  });

  const consulta = query(colecao, orderBy("data", "desc"));
  onSnapshot(consulta, (snapshot) => {
    registrosCache = snapshot.docs.map((d) => d.data());
    aplicarFiltros();
  });
}
