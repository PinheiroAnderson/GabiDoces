import { auth, db, onAuthStateChanged } from "../infra/firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Função para mostrar modal de sucesso
function mostrarSucesso(mensagem) {
    document.getElementById('sucesso-mensagem').textContent = mensagem;
    const modal = new bootstrap.Modal(document.getElementById('sucessoModal'));
    modal.show();
}

// Função para mostrar modal de erro
function mostrarErro(mensagem) {
    const modalElement = document.getElementById('sucessoModal');
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

// Máscara de telefone
function mascaraTelefone() {
    const element = document.getElementById('telefoneInput');
    if (!element) return;

    element.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, "");

        value = value.replace(/^(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\(\d{2}\) \d{5})(\d)/, "$1-$2");
        value = value.substring(0, 15);

        e.target.value = value;
    });
}

// Validação de telefone
function validaTelefone() {
    const element = document.getElementById('telefoneInput');
    const message = document.getElementById('telHelp');
    if (!element || !message) return;

    element.addEventListener('blur', () => {
        let value = element.value.replace(/\D/g, "");
        const isValid = value.length === 11;
        
        message.innerHTML = isValid 
            ? '<span class="text-success">Válido!</span>' 
            : '<span class="text-danger">Telefone inválido! Formato correto: (XX) XXXXX-XXXX</span>';
    });
}

// Carregar dados do usuário
async function carregarDadosUsuario() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Tentar buscar dados do Firestore
                    const docRef = doc(db, "client", user.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        const dados = docSnap.data();
                        document.getElementById('nomeInput').value = dados.nome || '';
                        document.getElementById('telefoneInput').value = dados.telefone || '';
                        document.getElementById('enderecoInput').value = dados.endereco || '';
                    }
                    
                    // Sempre preencher o email
                    document.getElementById('emailInput').value = user.email || '';
                    
                    resolve(user);
                } catch (error) {
                    console.error("Erro ao carregar dados:", error);
                    document.getElementById('emailInput').value = user.email || '';
                    resolve(user);
                }
            } else {
                // Usuário não está logado, redirecionar para login
                window.location.href = 'login.html';
                reject("Usuário não está logado");
            }
        });
    });
}

// Validar formulário
function validarFormulario() {
    const nome = document.getElementById('nomeInput').value.trim() !== "";
    const telefone = document.getElementById('telefoneInput').value.replace(/\D/g, "").length === 11;
    
    return nome && telefone;
}

// Salvar dados do perfil
async function salvarPerfil() {
    if (!validarFormulario()) {
        mostrarErro('Por favor, preencha todos os campos obrigatórios corretamente!');
        return;
    }
    
    const nome = document.getElementById('nomeInput').value;
    const telefone = document.getElementById('telefoneInput').value;
    const endereco = document.getElementById('enderecoInput').value;
    
    try {
        const user = await carregarDadosUsuario();
        
        // Usar setDoc com merge para criar o documento se não existir
        const docRef = doc(db, "client", user.uid);
        await setDoc(docRef, {
            nome: nome,
            telefone: telefone,
            endereco: endereco
        }, { merge: true });
        
        mostrarSucesso('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        mostrarErro('Erro ao salvar perfil. Tente novamente.');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    carregarDadosUsuario();
    mascaraTelefone();
    validaTelefone();
    
    document.getElementById('salvarButton').addEventListener('click', salvarPerfil);
});
