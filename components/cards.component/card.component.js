export async function cardComponent() {
    const localTemplate = 'components/cards.component/card.component.html'
    const localStyle = 'components/cards.component/card.component.css'
    const element = document.getElementById('card-component')
    if (!element) return

    // Adicionar o CSS antes do conteúdo
    const styleLink = `<link rel="stylesheet" href="${localStyle}">`
    
    const services = await getServices()
    console.log(services)

    fetch(localTemplate)
        .then((res) => res.text())
        .then((component) => {

            const cardsHtml = montaCard(services, component)
            element.innerHTML = styleLink + cardsHtml
            
            // Adicionar eventos de clique aos botões de encomendar
            adicionarEventosEncomendar()

        })
        .catch((error) => {
            console.error("Erro ao montar o componente: ", error);
        })
}

function montaCard(dados, template) {

    let result = ""
    for (let i = 0; i < dados.length; i++) {

        let newTemplate = template
        result += newTemplate
            .replace("{{imageUrl}}", dados[i].imageUrl)
            .replace("{{title}}", dados[i].title)
            .replace("{{description}}", dados[i].description)
    }
    return result

}

function adicionarEventosEncomendar() {
    // Importar auth aqui para garantir que está disponível
    import("../../js/infra/firebase.js")
        .then(({ auth, onAuthStateChanged }) => {
            const botoes = document.querySelectorAll('.btn-encomendar');
            botoes.forEach(botao => {
                botao.addEventListener('click', function() {
                    onAuthStateChanged(auth, (user) => {
                        if (user) {
                            // Usuário está logado
                            window.location.href = "pedidos.html";
                        } else {
                            // Usuário não está logado
                            window.location.href = "login.html";
                        }
                    });
                });
            });
        })
        .catch(err => console.error("Erro ao importar firebase:", err));
}

async function getServices() {
    let result = []
    await fetch('mocks/service.json')
        .then((res) => res.json())
        .then((dados) => {
            result = dados
        })
        .catch((error) => {
            console.error("Erro ao montar o componente: ", error);
        })
    return result


}
