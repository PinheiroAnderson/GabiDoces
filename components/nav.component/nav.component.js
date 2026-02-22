// navBarComponent()

import { auth, onAuthStateChanged, signOut } from "../../js/infra/firebase.js";

export function navBarComponentTemplate() {

    const localTemplate = 'components/nav.component/nav.component.html'
    const localStyle = 'components/nav.component/nav.component.css'
    const element = document.getElementById('navbar-component')
    
    if (!element) return;
    
    element.innerHTML = ''
    element.innerHTML += `<link rel="stylesheet" href="${localStyle}">` 
    
    fetch(localTemplate)
        .then((res) => res.text())
        .then((nav) => {

            element.innerHTML += nav
            
            // Após carregar a navbar, verificar estado de autenticação
            verificarAutenticacao()

        })
        .catch((error) => {

            console.error("Erro o carregar a navBar",error)

        })

}

function verificarAutenticacao() {
    onAuthStateChanged(auth, (user) => {
        const loginLink = document.getElementById('login-link');
        const encomendasLink = document.getElementById('encomendas-link');
        const usuarioMenu = document.querySelector('.usuario-menu');
        const nomeUsuario = document.getElementById('nome-usuario');
        const sairLink = document.getElementById('sair-link');
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        
        if (loginLink && usuarioMenu) {
            if (user) {
                // Usuário está logado - mostrar menu dropdown
                loginLink.style.display = 'none';
                usuarioMenu.style.display = 'block';
                
                // Mostrar nome do usuário
                const nome = user.displayName || user.email || 'Minha Conta';
                nomeUsuario.textContent = nome;
                
                // Link de Encomendas
                if (encomendasLink) {
                    encomendasLink.innerHTML = 'Faça seu pedido';
                    encomendasLink.href = 'pedidos.html';
                }
            } else {
                // Usuário não está logado - mostrar link de Login
                loginLink.style.display = 'block';
                loginLink.innerHTML = 'Login';
                loginLink.href = 'login.html';
                usuarioMenu.style.display = 'none';
                
                // Link de Encomendas
                if (encomendasLink) {
                    encomendasLink.innerHTML = 'Encomendas';
                    encomendasLink.href = 'login.html';
                }
            }
        }
        
        // Evento de logout
        if (sairLink) {
            sairLink.addEventListener('click', function(e) {
                e.preventDefault();
                signOut(auth).then(() => {
                    // Logout bem-sucedido
                    window.location.href = 'index.html';
                }).catch((error) => {
                    console.error('Erro ao fazer logout:', error);
                    alert('Erro ao fazer logout. Tente novamente.');
                });
            });
        }
    });
}
