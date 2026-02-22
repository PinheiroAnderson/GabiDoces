import {
  validaNome,
  validaEmail,
  validaTelefone,
  validaPassword,
  comparaSenha,
  validateAllCadastro,
} from "../service/validator.js";

import { Client } from "../domain/client.js";

import { cadastroService } from "../service/cadastro.service.js";

validaNome();
validaEmail();
validaTelefone();
validaPassword();
comparaSenha();
registrationForm();

function getFormClient() {
  const client = new Client();
  client.name = document.querySelector("#nomeInput").value;
  client.phone = document.querySelector("#telefoneInput").value;
  client.email = document.querySelector("#emailInput").value;
  client.password = document.querySelector("#senhaInput").value;
  client.picture = document.querySelector("#foto").value;
  return client;
}

// Função para mostrar modal de sucesso
function mostrarSucesso(mensagem, redirecionar = null) {
    const modalElement = document.getElementById('sucessoModal');
    if (!modalElement) {
        alert(mensagem);
        if (redirecionar) window.location.href = redirecionar;
        return;
    }
    document.getElementById('sucesso-mensagem').textContent = mensagem;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    if (redirecionar) {
        modal._element.addEventListener('hidden.bs.modal', function() {
            window.location.href = redirecionar;
        });
    }
}

// Função para mostrar modal de erro
function mostrarErro(mensagem) {
    const modalElement = document.getElementById('sucessoModal');
    if (!modalElement) {
        alert(mensagem);
        return;
    }
    document.getElementById('sucesso-mensagem').textContent = mensagem;
    modalElement.querySelector('.modal-header').className = 'modal-header bg-danger text-white';
    modalElement.querySelector('.modal-title').textContent = 'Erro!';
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        modalElement.querySelector('.modal-header').className = 'modal-header bg-success text-white';
        modalElement.querySelector('.modal-title').textContent = 'Sucesso!';
    });
}

function registrationForm() {
  const registerButton = document.querySelector("#registerButton");
  registerButton.addEventListener("click", () => {
    if (validateAllCadastro()) {
      const client = getFormClient();
      cadastroService.add(client)
        .then(() => {
          mostrarSucesso('Cadastro realizado com sucesso! Você será redirecionado para fazer seu primeiro pedido.', 'pedidos.html');
        })
        .catch((error) => {
          mostrarErro(error.message || 'Ocorreu um erro ao realizar o cadastro. Tente novamente.');
        });
    } else {
      mostrarErro('Por favor, verifique os dados informados e tente novamente.');
    }
  });
}
