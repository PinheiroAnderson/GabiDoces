function showError(element, message, isValid) {
  if (!element) return;
  // Se for válido, mostra mensagem de sucesso; se não, exibe a mensagem de erro
  element.innerHTML = isValid
    ? '<span class="text-success">Válido!</span>'
    : `<span class="text-danger">${message}</span>`;
}

export function validaNome() {
  const element = document.querySelector("#nomeInput");
  const message = document.querySelector("#nomeHelp");
  if (!element || !message) return;

  element.addEventListener("blur", (e) => {
    const value = e.target.value.trim();
    const isValid = value !== "";
    showError(message, "Preencha o campo corretamente.", isValid);
  });
}

export function validaEmail() {
  const element = document.querySelector("#emailInput");
  const message = document.querySelector("#emailHelp");
  const regexEmail = /^[a-z0-9_.=-]+@[a-zA-Z0-9-]+\.([a-zA-Z0-9-.]{2,})+$/g;

  if (!element || !message) return;

  element.addEventListener("keyup", (e) => {
    const value = e.target.value.trim();
    const isValid = regexEmail.test(value);
    showError(message, "Insira um e-mail válido.", isValid);
  });
}

export function validaTelefone() {
  const element = document.querySelector("#telefoneInput");
  const message = document.querySelector("#telHelp");

  if (!element || !message) return;

  element.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

    value = value.replace(/^(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\(\d{2}\) \d{5})(\d)/, "$1-$2");
    value = value.substring(0, 15);

    const isValid = value.replace(/\D/g, "").length === 11;
    showError(
      message,
      "Telefone inválido! Formato correto: (XX) XXXXX-XXXX",
      isValid
    );

    e.target.value = value;
  });
}

export function validaPassword() {
  const element = document.querySelector("#senhaInput");
  const message = document.querySelector("#senhaHelp");
  const regexSenha = /^.{6,}$/;

  if (!element || !message) return;

  element.addEventListener("keyup", (e) => {
    const value = e.target.value.trim();
    const isValid = regexSenha.test(value);
    showError(message, "A senha deve ter pelo menos 6 caracteres.", isValid);
  });
}

export function comparaSenha() {
  const senhaInput = document.querySelector("#senhaInput");
  const confirmaSenhaInput = document.querySelector("#confirmasenhaInput");
  const message = document.querySelector("#confirmaHelp");

  if (!senhaInput || !confirmaSenhaInput || !message) return;

  confirmaSenhaInput.addEventListener("keyup", () => {
    const senha = senhaInput.value;
    const confirma = confirmaSenhaInput.value;
    const isValid = senha === confirma;
    showError(message, "As senhas não coincidem.", isValid);
  });
}

export function validarDocumento() {
  // Função mantida para compatibilidade mas não é usada no formulário simples
}

export function validateRequired() {
  // Função mantida para compatibilidade
}

export function validateAllCadastro() {
  const nome = document.querySelector("#nomeInput")?.value.trim() !== "";
  const email = /^[a-z0-9_.=-]+@[a-zA-Z0-9-]+\.([a-zA-Z0-9-.]{2,})+$/g.test(document.querySelector("#emailInput")?.value.trim() || "");
  const telefone = document.querySelector("#telefoneInput")?.value.replace(/\D/g, "").length === 11;
  const senha = /^.{6,}$/.test(document.querySelector("#senhaInput")?.value || "");
  const confirmaSenha = document.querySelector("#senhaInput")?.value === document.querySelector("#confirmasenhaInput")?.value;

  return nome && email && telefone && senha && confirmaSenha;
}

export function validateAppointment() {
  const service = document.querySelector("#serviceSelect")?.value !== "";
  const date = document.querySelector("#appointmentDate")?.value;
  const time = document.querySelector("#appointmentTime")?.value;

  const today = new Date().toISOString().split('T')[0];
  const isDateValid = date >= today;

  return service && date && time && isDateValid;
}
