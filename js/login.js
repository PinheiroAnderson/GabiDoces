import { signInWithEmailAndPassword, auth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "./infra/firebase.js";

// Função para mostrar modal de sucesso
function mostrarSucesso(mensagem, redirecionar = null) {
    document.getElementById('sucesso-mensagem').textContent = mensagem;
    const modal = new bootstrap.Modal(document.getElementById('sucessoModal'));
    modal.show();
    
    if (redirecionar) {
        modal._element.addEventListener('hidden.bs.modal', function() {
            window.location.href = redirecionar;
        });
    }
}

// Função para mostrar modal de erro
function mostrarErro(mensagem) {
    document.getElementById('sucesso-mensagem').textContent = mensagem;
    const modalElement = document.getElementById('sucessoModal');
    modalElement.querySelector('.modal-header').className = 'modal-header bg-danger text-white';
    modalElement.querySelector('.modal-title').textContent = 'Erro!';
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        modalElement.querySelector('.modal-header').className = 'modal-header bg-success text-white';
        modalElement.querySelector('.modal-title').textContent = 'Sucesso!';
    });
}

// Função para realizar login
function realizarLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Usuário logado:", user);
            
            // Verificar se é o admin
            if (email === 'admin@gabrielabolosedoces.com') {
                mostrarSucesso('Login realizado com sucesso!', 'admin-pedidos.html');
            } else {
                mostrarSucesso('Login realizado com sucesso!', 'pedidos.html');
            }
        })
        .catch((error) => {
            console.error("Erro no login:", error);
            let errorMessage = "E-mail ou senha incorretos!";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "Usuário não encontrado.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Senha incorreta.";
            }
            document.getElementById('login-error').textContent = errorMessage;
            document.getElementById('login-error').style.display = 'block';
        });
}

document.getElementById('login-button').addEventListener('click', realizarLogin);

// Função para login com Google
function realizarLoginGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("Usuário logado com Google:", user);
            mostrarSucesso('Login realizado com sucesso!', 'pedidos.html');
        })
        .catch((error) => {
            console.error("Erro no login com Google:", error);
            mostrarErro('Erro no login com Google. Tente novamente.');
        });
}

document.getElementById('google-login-button').addEventListener('click', realizarLoginGoogle);

// Função para recuperação de senha - usando modal
function recuperarSenha() {
    const modalEl = document.getElementById('recuperarSenhaModal');
    const modal = new bootstrap.Modal(modalEl);
    const mensagemEl = document.getElementById('recuperar-senha-mensagem');
    const emailInput = document.getElementById('email-recuperar');
    const enviarBtn = document.getElementById('enviar-recuperar-btn');
    
    // Limpar campos
    emailInput.value = '';
    mensagemEl.textContent = '';
    mensagemEl.className = 'mt-3';
    
    // Mostrar modal
    modal.show();
    
    // Adicionar evento ao botão enviar
    enviarBtn.onclick = function() {
        const email = emailInput.value.trim();
        
        if (!email) {
            mensagemEl.textContent = 'Por favor, digite seu e-mail!';
            mensagemEl.className = 'mt-3 text-danger';
            return;
        }
        
        enviarBtn.disabled = true;
        enviarBtn.textContent = 'Enviando...';
        
        sendPasswordResetEmail(auth, email)
            .then(() => {
                mensagemEl.textContent = 'E-mail de recuperação enviado! Verifique sua caixa de entrada.';
                mensagemEl.className = 'mt-3 text-success';
                setTimeout(() => {
                    modal.hide();
                }, 2000);
            })
            .catch((error) => {
                console.error("Erro na recuperação de senha:", error);
                if (error.code === 'auth/user-not-found') {
                    mensagemEl.textContent = 'E-mail não encontrado. Verifique e tente novamente.';
                } else {
                    mensagemEl.textContent = 'Erro ao enviar e-mail. Tente novamente mais tarde.';
                }
                mensagemEl.className = 'mt-3 text-danger';
            })
            .finally(() => {
                enviarBtn.disabled = false;
                enviarBtn.textContent = 'Enviar';
            });
    };
}

document.getElementById('forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    recuperarSenha();
});

// Verificar estado de autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuário autenticado:", user);
    } else {
        console.log("Usuário não autenticado");
    }
});
