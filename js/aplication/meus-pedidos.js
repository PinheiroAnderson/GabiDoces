import { auth, db, onAuthStateChanged } from "../infra/firebase.js";
import { collection, query, getDocs, orderBy, doc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Função para mostrar modal de sucesso
function mostrarSucesso(mensagem) {
    document.getElementById('sucesso-mensagem').textContent = mensagem;
    const modal = new bootstrap.Modal(document.getElementById('sucessoModal'));
    modal.show();
}

// Função para mostrar modal de erro
function mostrarErro(mensagem) {
    document.getElementById('erro-mensagem').textContent = mensagem;
    const modal = new bootstrap.Modal(document.getElementById('erroModal'));
    modal.show();
}

// Carregar pedidos do usuário
async function carregarPedidos() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Buscar o cliente pelo email
                    const clientesRef = collection(db, "client");
                    const q = query(clientesRef, where("email", "==", user.email));
                    const snapshot = await getDocs(q);
                    
                    if (snapshot.empty) {
                        exibirPedidos([]);
                        resolve([]);
                        return;
                    }
                    
                    // Usar o ID do primeiro cliente encontrado
                    const clienteId = snapshot.docs[0].id;
                    
                    const pedidosRef = collection(db, "client", clienteId, "pedidos");
                    const pedidosQuery = query(pedidosRef, orderBy("criadoEm", "desc"));
                    
                    const querySnapshot = await getDocs(pedidosQuery);
                    
                    const pedidos = [];
                    querySnapshot.forEach((doc) => {
                        pedidos.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    // Armazenar o clienteId para uso na exclusão
                    window.clienteIdAtual = clienteId;
                    
                    exibirPedidos(pedidos);
                    resolve(pedidos);
                } catch (error) {
                    console.error("Erro ao carregar pedidos:", error);
                    exibirPedidos([]);
                    resolve([]);
                }
            } else {
                window.location.href = 'login.html';
                reject("Usuário não está logado");
            }
        });
    });
}

function exibirPedidos(pedidos) {
    const carregando = document.getElementById('carregando');
    const semPedidos = document.getElementById('sem-pedidos');
    const listaPedidos = document.getElementById('lista-pedidos');
    
    carregando.style.display = 'none';
    
    if (pedidos.length === 0) {
        semPedidos.style.display = 'block';
        listaPedidos.style.display = 'none';
        return;
    }
    
    semPedidos.style.display = 'none';
    listaPedidos.style.display = 'block';
    
    let html = '';
    
    pedidos.forEach(pedido => {
        const data = pedido.criadoEm ? new Date(pedido.criadoEm.seconds * 1000).toLocaleDateString('pt-BR') : 'Data não informada';
        const status = pedido.status || 'Aguardando confirmação';
        
        let statusClasse = 'bg-warning';
        if (status === 'Em produção') statusClasse = 'bg-info';
        if (status === 'Entregue') statusClasse = 'bg-success';
        if (status === 'Rejeitado') statusClasse = 'bg-danger';
        
        // Não mostrar botão excluir para o cliente
        let botaoExcluir = '';
        
        html += `
            <div class="pedido-card">
                <div class="pedido-header">
                    <div>
                        <strong>Pedido #${pedido.id.substring(0, 8)}</strong>
                        <span class="badge ${statusClasse} ms-2">${status}</span>
                    </div>
                    <span class="pedido-data">${data}</span>
                </div>
                <div class="pedido-itens">
                    <h5>Itens:</h5>
                    <ul>
        `;
        
        if (pedido.itens && pedido.itens.length > 0) {
            pedido.itens.forEach(item => {
                html += `<li>${item.nome} - ${item.tamanho} - Qtd: ${item.quantidade} - R$ ${item.precoTotal.toFixed(2).replace('.', ',')}</li>`;
            });
        }
        
        html += `
                    </ul>
                </div>
                <div class="pedido-total">
                    <strong>Total: R$ ${pedido.total ? pedido.total.toFixed(2).replace('.', ',') : '0,00'}</strong>
                </div>
                <div class="pedido-info">
                    <p><strong>Data de Entrega:</strong> ${pedido.dataEntrega || 'Não informada'}</p>
                    <p><strong>Endereço:</strong> ${pedido.endereco || 'Não informado'}</p>
                    <p><strong>Pagamento:</strong> ${pedido.pagamento || 'Não informado'}</p>
                </div>
                <div class="pedido-acoes mt-3">
                    ${botaoExcluir}
                </div>
            </div>
        `;
    });
    
    listaPedidos.innerHTML = html;
}

// Adicionar estilos para os cards de pedido
const style = document.createElement('style');
style.textContent = `
    .pedido-card {
        background: white;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        border: 2px solid var(--primary);
        box-shadow: 0 4px 12px rgba(64, 30, 54, 0.1);
    }
    .pedido-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }
    .pedido-data {
        color: #666;
        font-size: 0.9rem;
    }
    .pedido-itens h5 {
        font-family: var(--font-title);
        color: var(--secondary);
        font-size: 1.1rem;
    }
    .pedido-itens ul {
        list-style: none;
        padding-left: 0;
    }
    .pedido-itens li {
        padding: 5px 0;
        color: #555;
    }
    .pedido-total {
        font-size: 1.2rem;
        color: var(--secondary);
        text-align: right;
        padding: 10px 0;
        border-top: 1px solid #eee;
        margin-top: 10px;
    }
    .pedido-info {
        background: var(--light-pink);
        padding: 15px;
        border-radius: 10px;
        margin-top: 10px;
    }
    .pedido-info p {
        margin: 5px 0;
        font-size: 0.9rem;
    }
    .btn-excluir-pedido {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }
    .btn-excluir-pedido:hover {
        background-color: #bb2d3b;
    }
    .pedido-acoes {
        text-align: right;
    }
`;
document.head.appendChild(style);

// Função para excluir pedido
window.excluirPedido = async function(pedidoId) {
    const modal = new bootstrap.Modal(document.getElementById('confirmarExcluirModal'));
    modal.show();
    
    // Configurar o botão de confirmação
    const btnConfirmar = document.getElementById('confirmar-excluir-pedido');
    const confirmarExclusao = async function() {
        const user = auth.currentUser;
        const clienteId = window.clienteIdAtual;
        
        if (!user || !clienteId) {
            mostrarErro('Você precisa estar logado para excluir um pedido.');
            modal.hide();
            btnConfirmar.removeEventListener('click', confirmarExclusao);
            return;
        }
        
        try {
            const docRef = doc(db, "client", clienteId, "pedidos", pedidoId);
            await deleteDoc(docRef);
            mostrarSucesso('Pedido excluído com sucesso!');
            carregarPedidos();
            modal.hide();
        } catch (error) {
            console.error("Erro ao excluir pedido:", error);
            mostrarErro('Erro ao excluir pedido. Tente novamente.');
            modal.hide();
        }
        
        btnConfirmar.removeEventListener('click', confirmarExclusao);
    };
    
    btnConfirmar.addEventListener('click', confirmarExclusao);
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    carregarPedidos();
});
