// Carrinho de compras
let carrinho = [];

// Firebase
import { auth, db, onAuthStateChanged } from "../infra/firebase.js";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Verificar se usuário está logado
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Redirecionar para login se não estiver logado
        window.location.href = 'login.html';
    }
});

// Preços dos produtos
const precos = {
    bolos: {
        'bolo1': { P: 45, M: 65, G: 85, nome: 'Bolo de Chocolate' },
        'bolo2': { P: 50, M: 70, G: 90, nome: 'Bolo de Morango' },
        'bolo3': { P: 40, M: 60, G: 80, nome: 'Bolo de Cenoura' }
    },
    docinhos: {
        'docinho1': { P: 25, M: 45, G: 65, nome: 'Docinhos Variados' },
        'docinho2': { P: 28, M: 50, G: 72, nome: 'Brigadeiros' },
        'docinho3': { P: 22, M: 40, G: 58, nome: 'Beijinhos' }
    },
    cupcakes: {
        'cupcake1': { P: 30, M: 55, G: 100, nome: 'Cupcakes Variados' },
        'cupcake2': { P: 32, M: 58, G: 105, nome: 'Cupcakes de Chocolate' },
        'cupcake3': { P: 38, M: 68, G: 125, nome: 'Cupcakes Red Velvet' }
    },
    kits: {
        'kit1': { P: 120, M: 180, G: 250, nome: 'Kit Festinha' },
        'kit2': { P: 180, M: 250, G: 350, nome: 'Kit Aniversário' },
        'kit3': { P: 150, M: 220, G: 320, nome: 'Kit Corporativo' }
    },
    montekit: {
        'bolo': { P: 45, M: 65, G: 85, nome: 'Bolo' },
        'docinho': { P: 25, M: 45, G: 65, nome: 'Docinhos (un)' },
        'cupcake': { P: 30, M: 55, G: 100, nome: 'Cupcakes (un)' },
        'minibolo': { P: 40, M: 70, G: 120, nome: 'Mini Bolos (un)' }
    }
};

// Número do WhatsApp da Gabriela (substitua pelo número real)
const whatsappNumero = '5521964681384';

// Função para mostrar modal de sucesso
function mostrarSucesso(mensagem) {
    document.getElementById('sucesso-mensagem').textContent = mensagem;
    const modal = new bootstrap.Modal(document.getElementById('sucessoModal'));
    modal.show();
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

// Função para adicionar ao carrinho
function adicionarAoCarrinho(produto, tamanho, quantidade, categoria) {
    const precosCategoria = precos[categoria];
    const precoUnitario = precosCategoria[produto][tamanho];
    const nomeProduto = precosCategoria[produto].nome;
    
    const item = {
        id: Date.now(),
        produto: produto,
        nome: nomeProduto,
        tamanho: tamanho,
        quantidade: parseInt(quantidade),
        precoUnitario: precoUnitario,
        precoTotal: precoUnitario * parseInt(quantidade),
        categoria: categoria
    };
    
    carrinho.push(item);
    atualizarCarrinho();
}

// Função para atualizar o carrinho na interface
function atualizarCarrinho() {
    const tbody = document.getElementById('carrinho-corpo');
    const vazio = document.getElementById('carrinho-vazio');
    const totalEl = document.getElementById('total-pedido');
    
    tbody.innerHTML = '';
    
    if (carrinho.length === 0) {
        vazio.style.display = 'block';
        totalEl.textContent = '0,00';
        return;
    }
    
    vazio.style.display = 'none';
    
    let total = 0;
    
    carrinho.forEach(item => {
        total += item.precoTotal;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.tamanho}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.precoTotal.toFixed(2).replace('.', ',')}</td>
            <td>
                <button class="btn-excluir" onclick="removerDoCarrinho(${item.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    totalEl.textContent = total.toFixed(2).replace('.', ',');
    
    // Adicionar estilo ao botão excluir
    const style = document.createElement('style');
    style.textContent = `
        .btn-excluir {
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 5px;
            cursor: pointer;
        }
        .btn-excluir:hover {
            background-color: #bb2d3b;
        }
    `;
    document.head.appendChild(style);
}

// Função para remover do carrinho
function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    atualizarCarrinho();
}

// Função para limpar o carrinho
function limparCarrinho() {
    carrinho = [];
    atualizarCarrinho();
}

// Função para abrir o modal de finalização
function abrirModalFinalizacao() {
    if (carrinho.length === 0) {
        mostrarErro('Seu carrinho está vazio!');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('finalizarModal'));
    modal.show();
}

// Função para gerar mensagem do pedido para WhatsApp
function gerarMensagemWhatsApp(pedidoId, clienteId, dataEntrega, horarioEntrega, endereco, pagamento, clienteNome, clienteTelefone) {
    let mensagem = '*PEDIDO - Gabriela Bolos e Doces*\n\n';
    
    // Informações do cliente
    mensagem += `*DADOS DO CLIENTE*\n`;
    mensagem += `👤 Nome: ${clienteNome}\n`;
    mensagem += `📱 Telefone: ${clienteTelefone}\n`;
    mensagem += `📧 Email: ${auth.currentUser?.email}\n\n`;
    
    carrinho.forEach(item => {
        mensagem += `• ${item.nome} - Tamanho: ${item.tamanho}\n`;
        mensagem += `  Qtd: ${item.quantidade} - R$ ${item.precoTotal.toFixed(2).replace('.', ',')}\n\n`;
    });
    
    const total = document.getElementById('total-pedido').textContent;
    mensagem += `*TOTAL: R$ ${total}*\n\n`;
    mensagem += `📅 Data de Entrega: ${dataEntrega}\n`;
    mensagem += `🕐 Horário: ${horarioEntrega}\n`;
    mensagem += `📍 Endereço: ${endereco}\n`;
    mensagem += `💳 Pagamento: ${pagamento}\n\n`;
    mensagem += `_Pedido realizado através do site_`;
    
    return encodeURIComponent(mensagem);
}

// Função para salvar pedido no Firestore
async function salvarPedidoFirestore(dataEntrega, horarioEntrega, endereco, pagamento) {
    const user = auth.currentUser;
    
    if (!user) return null;
    
    const total = carrinho.reduce((sum, item) => sum + item.precoTotal, 0);
    
    const pedido = {
        usuarioId: user.uid,
        usuarioEmail: user.email,
        itens: carrinho.map(item => ({
            nome: item.nome,
            tamanho: item.tamanho,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            precoTotal: item.precoTotal,
            categoria: item.categoria
        })),
        total: total,
        dataEntrega: dataEntrega,
        horarioEntrega: horarioEntrega,
        endereco: endereco,
        pagamento: pagamento,
        status: 'Aguardando confirmação',
        criadoEm: serverTimestamp()
    };
    
    try {
        // Buscar o ID do cliente pelo email
        const clientesRef = collection(db, "client");
        const q = query(clientesRef, where("email", "==", user.email));
        const snapshot = await getDocs(q);
        
        let clienteId;
        let clienteNome = "Cliente";
        let clienteTelefone = "Não informado";
        
        if (!snapshot.empty) {
            const clienteData = snapshot.docs[0].data();
            clienteId = snapshot.docs[0].id;
            clienteNome = clienteData.name || clienteData.nome || "Cliente";
            clienteTelefone = clienteData.phone || clienteData.telefone || "Não informado";
        } else {
            clienteId = user.uid;
        }
        
        // Adicionar dados do cliente ao pedido
        pedido.clienteNome = clienteNome;
        pedido.clienteTelefone = clienteTelefone;
        
        // Salvar pedido na coleção do cliente
        const pedidosRef = collection(db, "client", clienteId, "pedidos");
        const docRef = await addDoc(pedidosRef, pedido);
        return { 
            pedidoId: docRef.id, 
            clienteId: clienteId,
            clienteNome: clienteNome,
            clienteTelefone: clienteTelefone
        };
    } catch (error) {
        console.error("Erro ao salvar pedido:", error);
        return { pedidoId: null, clienteId: null, clienteNome: "Cliente", clienteTelefone: "Não informado" };
    }
}

// Função para confirmar o pedido e enviar via WhatsApp
async function confirmarPedido() {
    const dataEntrega = document.getElementById('data-entrega').value;
    const horarioEntrega = document.getElementById('horario-entrega').value;
    const endereco = document.getElementById('endereco-entrega').value;
    const pagamento = document.getElementById('pagamento').value;
    
    if (!dataEntrega || !horarioEntrega || !endereco || !pagamento) {
        mostrarErro('Por favor, preencha todos os campos!');
        return;
    }
    
    const user = auth.currentUser;
    
    // Salvar pedido no Firestore e obter o ID
    const result = await salvarPedidoFirestore(dataEntrega, horarioEntrega, endereco, pagamento);
    
    if (!result || !result.pedidoId) {
        mostrarErro('Erro ao salvar pedido. Tente novamente.');
        return;
    }
    
    // Gerar mensagem do pedido com o ID e dados do cliente
    const mensagemWhatsApp = gerarMensagemWhatsApp(
        result.pedidoId, 
        result.clienteId, 
        dataEntrega, 
        horarioEntrega, 
        endereco, 
        pagamento,
        result.clienteNome,
        result.clienteTelefone
    );
    
    // Abrir WhatsApp
    const urlWhatsApp = `https://wa.me/${whatsappNumero}?text=${mensagemWhatsApp}`;
    window.open(urlWhatsApp, '_blank');
    
    // Limpar o carrinho e fechar o modal
    limparCarrinho();
    const modal = bootstrap.Modal.getInstance(document.getElementById('finalizarModal'));
    modal.hide();
    
    // Limpar o formulário
    document.getElementById('form-finalizacao').reset();
    
    // Redirecionar para página de pedidos
    window.location.href = 'meus-pedidos.html';
}

// Adicionar event listeners
document.addEventListener('DOMContentLoaded', function() {
    
    // Funcionalidade para desmarcar radio buttons ao clicar novamente
    const todosRadios = document.querySelectorAll('input[type="radio"]');
    let estadoAnterior = {};
    
    // Salva o estado inicial de cada radio
    todosRadios.forEach(radio => {
        const key = radio.name + '_' + radio.value;
        estadoAnterior[key] = radio.checked;
    });
    
    todosRadios.forEach(radio => {
        radio.addEventListener('click', function() {
            const key = this.name + '_' + this.value;
            
            // Se já estava marcado antes do clique, significa que o usuário quer desmarcar
            if (estadoAnterior[key]) {
                this.checked = false;
                estadoAnterior[key] = false;
            } else {
                // Marca este e reseta o estado dos outros do mesmo grupo
                todosRadios.forEach(r => {
                    if (r.name === this.name) {
                        estadoAnterior[r.name + '_' + r.value] = false;
                    }
                });
                estadoAnterior[key] = true;
            }
        });
    });
    
    // Botões adicionar (exceto monte kit)
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar:not(.btn-kit)');
    botoesAdicionar.forEach(botao => {
        botao.addEventListener('click', function() {
            const card = this.closest('.produto-card');
            const radioTamanho = card.querySelector('input[type="radio"]:checked');
            const quantidade = card.querySelector('.quantidade').value;
            
            if (!radioTamanho) {
                mostrarErro('Por favor, selecione um tamanho!');
                return;
            }
            
            if (!quantidade || parseInt(quantidade) < 1) {
                mostrarErro('Por favor, insira uma quantidade válida!');
                return;
            }
            
            // Determinar a categoria baseada no elemento pai
            const tabPane = card.closest('.tab-pane');
            let categoria = '';
            let produto = '';
            
            if (tabPane.id === 'bolos') {
                categoria = 'bolos';
                produto = card.querySelector('h3').textContent.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (produto.includes('chocolate')) produto = 'bolo1';
                else if (produto.includes('morango')) produto = 'bolo2';
                else if (produto.includes('cenoura')) produto = 'bolo3';
            } else if (tabPane.id === 'docinhos') {
                categoria = 'docinhos';
                produto = card.querySelector('h3').textContent.toLowerCase().replace(/[^a-z]/g, '');
                if (produto.includes('variados')) produto = 'docinho1';
                else if (produto.includes('brigadeiros')) produto = 'docinho2';
                else produto = 'docinho3';
            } else if (tabPane.id === 'cupcakes') {
                categoria = 'cupcakes';
                produto = card.querySelector('h3').textContent.toLowerCase().replace(/[^a-z]/g, '');
                if (produto.includes('variados')) produto = 'cupcake1';
                else if (produto.includes('chocolate') && !produto.includes('red')) produto = 'cupcake2';
                else produto = 'cupcake3';
            } else if (tabPane.id === 'kits') {
                categoria = 'kits';
                produto = card.querySelector('h3').textContent.toLowerCase().replace(/[^a-z]/g, '');
                if (produto.includes('festinha')) produto = 'kit1';
                else if (produto.includes('anivers')) produto = 'kit2';
                else produto = 'kit3';
            }
            
            adicionarAoCarrinho(produto, radioTamanho.value, quantidade, categoria);
            mostrarSucesso('Item adicionado ao carrinho!');
        });
    });
    
    // Botão monte seu kit
    const btnKit = document.querySelector('.btn-kit');
    if (btnKit) {
        btnKit.addEventListener('click', function() {
            const container = document.querySelector('.monte-kit-opcoes');
            let temItem = false;
            
            // Bolos
            const boloQtdInput = container.querySelector('input[name="monte_bolo_tamanho"]');
            if (boloQtdInput) {
                const boloCard = boloQtdInput.closest('.kit-item');
                const boloQtd = boloCard.querySelector('.quantidade').value;
                const boloTamanho = container.querySelector('input[name="monte_bolo_tamanho"]:checked');
                
                if (boloQtd && parseInt(boloQtd) > 0 && boloTamanho) {
                    adicionarAoCarrinho('bolo', boloTamanho.value, boloQtd, 'montekit');
                    temItem = true;
                }
            }
            
            // Docinhos
            const docinhoQtdInput = container.querySelector('input[name="monte_docinho_tamanho"]');
            if (docinhoQtdInput) {
                const docinhoCard = docinhoQtdInput.closest('.kit-item');
                const docinhoQtd = docinhoCard.querySelector('.quantidade').value;
                const docinhoTamanho = container.querySelector('input[name="monte_docinho_tamanho"]:checked');
                
                if (docinhoQtd && parseInt(docinhoQtd) > 0 && docinhoTamanho) {
                    adicionarAoCarrinho('docinho', docinhoTamanho.value, docinhoQtd, 'montekit');
                    temItem = true;
                }
            }
            
            // Cupcakes
            const cupcakeQtdInput = container.querySelector('input[name="monte_cupcake_tamanho"]');
            if (cupcakeQtdInput) {
                const cupcakeCard = cupcakeQtdInput.closest('.kit-item');
                const cupcakeQtd = cupcakeCard.querySelector('.quantidade').value;
                const cupcakeTamanho = container.querySelector('input[name="monte_cupcake_tamanho"]:checked');
                
                if (cupcakeQtd && parseInt(cupcakeQtd) > 0 && cupcakeTamanho) {
                    adicionarAoCarrinho('cupcake', cupcakeTamanho.value, cupcakeQtd, 'montekit');
                    temItem = true;
                }
            }
            
            // Mini Bolos
            const miniboloQtdInput = container.querySelector('input[name="monte_minibolo_tamanho"]');
            if (miniboloQtdInput) {
                const miniboloCard = miniboloQtdInput.closest('.kit-item');
                const miniboloQtd = miniboloCard.querySelector('.quantidade').value;
                const miniboloTamanho = container.querySelector('input[name="monte_minibolo_tamanho"]:checked');
                
                if (miniboloQtd && parseInt(miniboloQtd) > 0 && miniboloTamanho) {
                    adicionarAoCarrinho('minibolo', miniboloTamanho.value, miniboloQtd, 'montekit');
                    temItem = true;
                }
            }
            
            if (temItem) {
                mostrarSucesso('Kit personalizado adicionado ao carrinho!');
            } else {
                mostrarErro('Por favor, selecione pelo menos um item para o seu kit!');
            }
        });
    }
    
    // Botão limpar carrinho
    const btnLimpar = document.getElementById('btn-limpar');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                limparCarrinho();
                mostrarSucesso('Carrinho limpo com sucesso!');
            }
        });
    }
    
    // Botão finalizar pedido
    const btnFinalizar = document.getElementById('btn-finalizar');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', abrirModalFinalizacao);
    }
    
    // Botão confirmar pedido
    const btnConfirmar = document.getElementById('confirmar-pedido');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', confirmarPedido);
    }
});

// Tornar funções disponíveis globalmente
window.removerDoCarrinho = removerDoCarrinho;
