const produtos = [
  {
    id: 1,
    nome: "Vaso artesanal",
    preco: 85,
    categoria: "Decoração",
    imagem: "vasos.jpg",
    descricao: "Peça decorativa feita à mão para ambientes internos."
  },
  {
    id: 2,
    nome: "Bolsa de crochê",
    preco: 120,
    categoria: "Crochê",
    imagem: "bolsa croche.jpg",
    descricao: "Bolsa artesanal elegante e resistente para uso diário."
  },
  {
    id: 3,
    nome: "Escultura em madeira",
    preco: 150,
    categoria: "Madeira",
    imagem: "escultura de madeira.jpg",
    descricao: "Escultura detalhada em madeira natural com acabamento manual."
  },
  {
    id: 4,
    nome: "Caneca de cerâmica",
    preco: 65,
    categoria: "Cerâmica",
    imagem: "caneca ceramica.jpg",
    descricao: "Caneca artesanal feita em cerâmica com pintura exclusiva."
  },
  {
    id: 5,
    nome: "Quadro Personalizado",
    preco: 95,
    categoria: "Personalizados",
    imagem: "quadro.jpg",
    descricao: "Quadro criativo e personalizado para presentes especiais."
  },
  {
    id: 6,
    nome: "Mesa de madeira",
    preco: 140,
    categoria: "Decoração",
    imagem: "Mesa de madeira.jpeg",
    descricao: "Peça decorativa artesanal ideal para sala ou cozinha."
  }
];

let carrinho = JSON.parse(localStorage.getItem("carrinhoArtesanato")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritosArtesanato")) || [];
let posts = JSON.parse(localStorage.getItem("postsComunidade")) || [];

let categoriaAtual = "Todos";
let modoFavoritos = false;

const listaProdutos = document.getElementById("listaProdutos");
const contadorCarrinho = document.getElementById("contadorCarrinho");
const itensCarrinho = document.getElementById("itensCarrinho");
const totalCarrinho = document.getElementById("totalCarrinho");
const buscaInput = document.getElementById("busca");
const feedPosts = document.getElementById("feedPosts");
const painelCarrinho = document.getElementById("painelCarrinho");
const overlay = document.getElementById("overlay");

// --- FUNÇÕES DE PERSISTÊNCIA ---
function salvarCarrinho() {
  localStorage.setItem("carrinhoArtesanato", JSON.stringify(carrinho));
}

function salvarFavoritos() {
  localStorage.setItem("favoritosArtesanato", JSON.stringify(favoritos));
}

function salvarPosts() {
  localStorage.setItem("postsComunidade", JSON.stringify(posts));
}

function formatarPreco(valor) {
  return valor.toFixed(2).replace(".", ",");
}

// --- COMUNIDADE (POSTS) ---
function renderPosts() {
  if (posts.length === 0) {
    feedPosts.innerHTML = `<p class="vazio">Ainda não há publicações na comunidade.</p>`;
    return;
  }

  feedPosts.innerHTML = posts.map(post => `
    <div class="post">
      <div class="post-topo">
        <strong>${post.nome}</strong>
        <span>${post.data}</span>
      </div>
      <div class="post-texto">${post.texto}</div>
      <div class="post-acoes">
        <button onclick="curtirPost(${post.id})">❤️ Curtir (${post.curtidas})</button>
        <button class="btn-excluir" onclick="excluirPost(${post.id})" style="color: red; margin-left: 10px; cursor: pointer; background: none; border: none;">
          🗑️ Excluir
        </button>
      </div>
    </div>
  `).join("");
}

function publicarPost() {
  const nome = document.getElementById("nomeUsuario").value.trim();
  const texto = document.getElementById("textoPost").value.trim();

  if (!nome || !texto) {
    alert("Preencha seu nome e escreva uma mensagem para publicar.");
    return;
  }

  const novoPost = {
    id: Date.now(),
    nome,
    texto,
    curtidas: 0,
    data: "Agora"
  };

  posts.unshift(novoPost);
  salvarPosts();
  renderPosts();

  document.getElementById("nomeUsuario").value = "";
  document.getElementById("textoPost").value = "";
}

function curtirPost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;

  post.curtidas++;
  salvarPosts();
  renderPosts();
}

function excluirPost(id) {
  if (confirm("Tem certeza que deseja excluir esta publicação?")) {
    posts = posts.filter(post => post.id !== id);
    salvarPosts();
    renderPosts();
  }
}

// --- LOJA E PRODUTOS ---
function renderProdutos() {
  const termoBusca = buscaInput.value.toLowerCase().trim();

  let produtosFiltrados = produtos.filter(produto => {
    const matchCategoria = categoriaAtual === "Todos" || produto.categoria === categoriaAtual;
    const matchBusca = produto.nome.toLowerCase().includes(termoBusca);
    return matchCategoria && matchBusca;
  });

  if (modoFavoritos) {
    produtosFiltrados = produtosFiltrados.filter(produto => favoritos.includes(produto.id));
  }

  if (produtosFiltrados.length === 0) {
    listaProdutos.innerHTML = `<div class="sem-resultados">Nenhum produto encontrado.</div>`;
    return;
  }

  listaProdutos.innerHTML = produtosFiltrados.map(produto => {
    const favoritoAtivo = favoritos.includes(produto.id);
    return `
      <div class="card">
        <img src="${produto.imagem}" alt="${produto.nome}">
        <div class="card-conteudo">
          <span class="card-categoria">${produto.categoria}</span>
          <h3>${produto.nome}</h3>
          <p>${produto.descricao}</p>
          <div class="preco">R$ ${formatarPreco(produto.preco)}</div>
          <div class="card-acoes">
            <button class="btn-add" onclick="adicionarAoCarrinho(${produto.id})">Adicionar</button>
            <button class="btn-favorito ${favoritoAtivo ? "ativo" : ""}" onclick="toggleFavorito(${produto.id})">
              ${favoritoAtivo ? "★" : "☆"}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// --- CARRINHO ---
function adicionarAoCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  const itemExistente = carrinho.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({ ...produto, quantidade: 1 });
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  contadorCarrinho.textContent = totalItens;

  if (carrinho.length === 0) {
    itensCarrinho.innerHTML = `<p class="vazio">Seu carrinho está vazio.</p>`;
    totalCarrinho.textContent = "0,00";
    return;
  }

  itensCarrinho.innerHTML = carrinho.map(item => `
    <div class="item-carrinho">
      <img src="${item.imagem}" alt="${item.nome}">
      <div class="item-info">
        <h4>${item.nome}</h4>
        <p>R$ ${formatarPreco(item.preco)}</p>
        <div class="item-controls">
          <button onclick="alterarQuantidade(${item.id}, -1)">-</button>
          <span>${item.quantidade}</span>
          <button onclick="alterarQuantidade(${item.id}, 1)">+</button>
        </div>
        <button class="remover-item" onclick="removerItem(${item.id})">Remover</button>
      </div>
    </div>
  `).join("");

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  totalCarrinho.textContent = formatarPreco(total);
}

function alterarQuantidade(id, mudanca) {
  const item = carrinho.find(produto => produto.id === id);
  if (!item) return;

  item.quantidade += mudanca;
  if (item.quantidade <= 0) {
    carrinho = carrinho.filter(produto => produto.id !== id);
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function removerItem(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  salvarCarrinho();
  atualizarCarrinho();
}

function limparCarrinho() {
  carrinho = [];
  salvarCarrinho();
  atualizarCarrinho();
}

function toggleFavorito(id) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(favId => favId !== id);
  } else {
    favoritos.push(id);
  }
  salvarFavoritos();
  renderProdutos();
}

// --- CONTROLES DE INTERFACE ---
function abrirCarrinho() {
  painelCarrinho.classList.add("aberto");
  overlay.classList.add("ativo");
}

function fecharCarrinho() {
  painelCarrinho.classList.remove("aberto");
  overlay.classList.remove("ativo");
}

// --- EVENT LISTENERS ---
document.getElementById("abrirCarrinho").addEventListener("click", abrirCarrinho);
document.getElementById("fecharCarrinho").addEventListener("click", fecharCarrinho);
document.getElementById("limparCarrinho").addEventListener("click", limparCarrinho);
document.getElementById("publicarPost").addEventListener("click", publicarPost);

document.getElementById("mostrarFavoritos").addEventListener("click", () => {
  modoFavoritos = true;
  renderProdutos();
});

document.getElementById("mostrarTodos").addEventListener("click", () => {
  modoFavoritos = false;
  renderProdutos();
});

overlay.addEventListener("click", fecharCarrinho);
buscaInput.addEventListener("input", renderProdutos);

document.querySelectorAll(".filtro-btn").forEach(botao => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".filtro-btn").forEach(btn => btn.classList.remove("ativo"));
    botao.classList.add("ativo");
    categoriaAtual = botao.dataset.categoria;
    renderProdutos();
  });
});

// --- INICIALIZAÇÃO ---
renderProdutos();
atualizarCarrinho();
renderPosts();
