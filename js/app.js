import { initPacientes } from "./pacientes.js";
import { initMedicos } from "./medicos.js";
import { initRegistros } from "./registros.js";
import { initRelatorios } from "./relatorios.js";

function initAbas() {
  const botoes = document.querySelectorAll(".aba-botao");
  const abas = document.querySelectorAll(".aba");

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      botoes.forEach((b) => b.classList.remove("ativa"));
      botao.classList.add("ativa");

      abas.forEach((aba) => {
        aba.hidden = aba.id !== `aba-${botao.dataset.aba}`;
      });
    });
  });
}

initAbas();
initPacientes();
initMedicos();
initRegistros();
initRelatorios();
