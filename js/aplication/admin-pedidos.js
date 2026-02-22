import { auth, db, onAuthStateChanged } from "../infra/firebase.js";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Email do admin
const ADMIN_EMAIL = 'admin@gabrielabolosedoces.com';

let currentUser = null;
let todosPedidos = [];

// Função para mostrar modal de mensagem
function showModal(titulo, mensagem, tipo = 'primary') {
    const modalEl = document.getElementById('mensagemModal');
    const modal = new bootstrap.Modal(modalEl);
    
    const modalLabel = document.getElementById('mensagemModalLabel');
    const modalBody = document.getElementById('mensagemModalBody');
    const modalFooter = modalEl.querySelector('.modal-footer');
    
    modalLabel.textContent = titulo;
    modalBody.textContent = mensagem;
    
    // Atualizar cores do header conforme o tipo
    const modalHeader = modalEl.querySelector('.modal-header');
    modalHeader.className = 'modal-header';
    if (tipo === 'success') modalHeader.classList.add('bg-success', 'text-white');
    else if (tipo === 'danger') modalHeader.classList.add('bg-danger', 'text-white');
    else if (tipo === 'warning') modalHeader.classList.add('bg-warning', 'text-dark');
    else modalHeader.classList.add('bg-primary', 'text-white');
    
    // Mostrar apenas botão OK
    modalFooter.innerHTML = '<button type="button" class="btn btn-light" data-bs-dismiss="modal">OK</button>';
    
    modal.show();
}

// Função para mostrar modal de confirmação
function showConfirmModal(mensagem, callback) {
    const modalEl = document.getElementById('confirmModal');
    const modal = new bootstrap.Modal(modalEl);
    
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmModalBtn');
    
    modalBody.textContent = mensagem;
    
    // Remover eventos anteriores
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Adicionar novo evento
    newConfirmBtn.addEventListener('click', () => {
        modal.hide();
        callback();
    });
    
    modal.show();
}

// Carregar todos os Pedidos de todos os clientes
async function carregarPedidos() {
    const listElement = document.getElementById('pedidos-list');
    
    try {
        // Buscar todos os clientes
        const clientesSnapshot = await getDocs(collection(db, "client"));
        
        todosPedidos = [];
        
        for (const clienteDoc of clientesSnapshot.docs) {
            const clienteId = clienteDoc.id;
            const clienteData = clienteDoc.data();
            
            // Buscar pedidos deste cliente
            const pedidosRef = collection(db, "client", clienteId, "pedidos");
            const pedidosSnapshot = await getDocs(query(pedidosRef, orderBy("criadoEm", "desc")));
            
            pedidosSnapshot.forEach(pedidoDoc => {
                todosPedidos.push({
                    id: pedidoDoc.id,
                    clienteId: clienteId,
                    clienteEmail: clienteData.email || pedidoDoc.data().usuarioEmail || 'N/A',
                    ...pedidoDoc.data()
                });
            });
        }
        
        exibirPedidos(todosPedidos);
        
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        listElement.innerHTML = '<div class="alert alert-danger">Erro ao carregar pedidos!</div>';
    }
}

function exibirPedidos(pedidos) {
    const listElement = document.getElementById('pedidos-list');
    const filtroStatus = document.getElementById('filtro-status').value;
    
    // Filtrar por status
    let pedidosFiltrados = pedidos;
    if (filtroStatus !== 'todos') {
        pedidosFiltrados = pedidos.filter(p => p.status === filtroStatus);
    }
    
    if (pedidosFiltrados.length === 0) {
        listElement.innerHTML = '<div class="alert alert-info">Nenhum pedido encontrado.</div>';
        return;
    }
    
    let html = '';
    
    pedidosFiltrados.forEach(pedido => {
        const data = pedido.criadoEm ? new Date(pedido.criadoEm.seconds * 1000).toLocaleString('pt-BR') : 'N/A';
        
        let statusBadge = 'bg-warning';
        if (pedido.status === 'Em produção') statusBadge = 'bg-info';
        if (pedido.status === 'Entregue') statusBadge = 'bg-success';
        if (pedido.status === 'Rejeitado') statusBadge = 'bg-danger';
        
        let itensHtml = '';
        if (pedido.itens && pedido.itens.length > 0) {
            pedido.itens.forEach(item => {
                itensHtml += `<li>${item.nome} - ${item.tamanho} - Qtd: ${item.quantidade} - R$ ${item.precoTotal.toFixed(2).replace('.', ',')}</li>`;
            });
        }
        
        let botoesAcao = '';
        if (pedido.status === 'Aguardando confirmação') {
            botoesAcao += `<button class="btn btn-success btn-sm me-1" onclick="confirmarPedido('${pedido.clienteId}', '${pedido.id}')">✓ Confirmar</button>`;
            botoesAcao += `<button class="btn btn-danger btn-sm" onclick="rejeitarPedido('${pedido.clienteId}', '${pedido.id}')">✗ Rejeitar</button>`;
        } else if (pedido.status === 'Em produção') {
            botoesAcao += `<button class="btn btn-primary btn-sm" onclick="marcarEntregue('${pedido.clienteId}', '${pedido.id}')">✓ Marcar Entregue</button>`;
        }
        
        html += `
            <div class="card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span><strong>Pedido #${pedido.id.substring(0, 8)}</strong></span>
                    <span class="badge ${statusBadge}">${pedido.status}</span>
                </div>
                <div class="card-body">
                    <p><strong>Cliente:</strong> ${pedido.clienteNome || 'Cliente'} (${pedido.clienteEmail})</p>
                    <p><strong>Telefone:</strong> ${pedido.clienteTelefone || 'Não informado'}</p>
                    <p><strong>Data do Pedido:</strong> ${data}</p>
                    <p><strong>Data de Entrega:</strong> ${pedido.dataEntrega}</p>
                    <p><strong>Horário:</strong> ${pedido.horarioEntrega}</p>
                    <p><strong>Endereço:</strong> ${pedido.endereco}</p>
                    <p><strong>Pagamento:</strong> ${pedido.pagamento}</p>
                    <p><strong>Total:</strong> R$ ${pedido.total.toFixed(2).replace('.', ',')}</p>
                    <h6>Itens:</h6>
                    <ul>${itensHtml}</ul>
                    <div class="mt-2">${botoesAcao}</div>
                </div>
            </div>
        `;
    });
    
    listElement.innerHTML = html;
}

// Funções globais para os botões
window.confirmarPedido = async function(clienteId, pedidoId) {
    try {
        const docRef = doc(db, "client", clienteId, "pedidos", pedidoId);
        await updateDoc(docRef, {
            status: "Em produção",
            confirmadoEm: new Date()
        });
        showModal('Sucesso', 'Pedido confirmado! Status alterado para "Em produção".', 'success');
        carregarPedidos();
    } catch (error) {
        console.error("Erro ao confirmar pedido:", error);
        showModal('Erro', 'Erro ao confirmar pedido.', 'danger');
    }
};

window.rejeitarPedido = async function(clienteId, pedidoId) {
    showConfirmModal('Tem certeza que deseja rejeitar este pedido?', async () => {
        try {
            const docRef = doc(db, "client", clienteId, "pedidos", pedidoId);
            await updateDoc(docRef, {
                status: "Rejeitado",
                rejeitadoEm: new Date()
            });
            showModal('Sucesso', 'Pedido rejeitado.', 'success');
            carregarPedidos();
        } catch (error) {
            console.error("Erro ao rejeitar pedido:", error);
            showModal('Erro', 'Erro ao rejeitar pedido.', 'danger');
        }
    });
};

window.marcarEntregue = async function(clienteId, pedidoId) {
    try {
        const docRef = doc(db, "client", clienteId, "pedidos", pedidoId);
        await updateDoc(docRef, {
            status: "Entregue",
            entregueEm: new Date()
        });
        showModal('Sucesso', 'Pedido marcado como entregue!', 'success');
        carregarPedidos();
    } catch (error) {
        console.error("Erro ao marcar pedido:", error);
        showModal('Erro', 'Erro ao marcar pedido.', 'danger');
    }
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    onAuthStateChanged(auth, (user) => {
        if (user && user.email === ADMIN_EMAIL) {
            // Usuário logado como admin - mostrar pedidos
            carregarPedidos();
        } else if (user) {
            // Logado mas não é admin
            showModal('Acesso Restrito', 'Apenas o administrador pode acessar esta página.', 'warning');
            signOut(auth).then(() => {
                window.location.href = 'login.html';
            });
        } else {
            // Não está logado - redirecionar para login
            window.location.href = 'login.html';
        }
    });
    
    document.getElementById('filtro-status').addEventListener('change', () => {
        exibirPedidos(todosPedidos);
    });
    
    document.getElementById('logout-button').addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Erro ao sair:", error);
        });
    });
});
