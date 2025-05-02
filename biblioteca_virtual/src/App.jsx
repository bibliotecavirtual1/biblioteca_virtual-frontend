import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8080/livrosvirtual";

function App() {
  const [livros, setLivros] = useState([]);
  const [livroAtual, setLivroAtual] = useState({
    id: "",
    titulo: "",
    autor: "",
    genero: "",
    descricao: ""
  });
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tela, setTela] = useState("home");
  const [livroParaExcluir, setLivroParaExcluir] = useState(null); // Novo estado para modal

  useEffect(() => {
    axios.get(API_URL)
      .then((response) => setLivros(response.data))
      .catch((error) => {
        console.error("Erro ao carregar livros:", error);
        setMensagem("Erro ao carregar os livros.");
      });
  }, []);

  const handleChange = (e) => {
    setLivroAtual({ ...livroAtual, [e.target.name]: e.target.value });
  };

  const salvarLivro = (e) => {
    e.preventDefault();
    const livro = { ...livroAtual };

    if (!livro.titulo || !livro.autor || !livro.genero || !livro.descricao) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    const metodo = editando ? axios.put : axios.post;
    const url = editando ? `${API_URL}/${livro.id}` : API_URL;

    metodo(url, livro)
      .then((response) => {
        setLivros(editando
          ? livros.map((l) => (l.id === livro.id ? response.data : l))
          : [...livros, response.data]);
        setMensagem(editando ? "Livro atualizado com sucesso!" : "Livro adicionado com sucesso!");
        setLivroAtual({ id: "", titulo: "", autor: "", genero: "", descricao: "" });
        setEditando(false);
        setTela("home");
        setTimeout(() => setMensagem(""), 3000);
      })
      .catch((error) => {
        setMensagem("Erro ao salvar o livro.");
        console.error(error);
      });
  };

  const editarLivro = (id) => {
    const livroSelecionado = livros.find((livro) => livro.id === id);
    if (livroSelecionado) {
      setLivroAtual(livroSelecionado);
      setEditando(true);
      setTela("formulario");
    }
  };

  const excluirLivro = (id) => {
    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        setLivros(livros.filter((livro) => livro.id !== id));
        setMensagem("Livro excluído com sucesso!");
        setTimeout(() => setMensagem(""), 3000);
      })
      .catch((error) => {
        console.error("Erro ao excluir o livro:", error);
        setMensagem("Erro ao excluir o livro.");
        setTimeout(() => setMensagem(""), 3000);
      });
    setLivroParaExcluir(null); // Fecha o modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200">
      <header className="bg-gradient-to-r from-blue-400 to-blue-900 p-6 flex justify-between items-center shadow-lg rounded-b-lg">
        <div className="flex items-center gap-5">
          <img src="/public/logo.png" alt="Logo" className="h-11 w-11" />
          <h1 className="text-white text-3xl font-semibold">Biblioteca Virtual</h1>
        </div>
        {tela === "home" && (
          <button
            onClick={() => {
              setLivroAtual({ id: "", titulo: "", autor: "", genero: "", descricao: "" });
              setEditando(false);
              setTela("formulario");
            }}
            className="bg-white text-black px-6 py-3 rounded-lg shadow-lg hover:bg-blue-200 transition-colors"
          >
            + Adicionar Livro
          </button>
        )}
      </header>

      <main className="p-10">
        {mensagem && (
          <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg mb-4 shadow-md">
            {mensagem}
          </div>
        )}

        {tela === "home" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {livros.length === 0 ? (
              <p className="text-lg text-gray-700">Nenhum livro adicionado ainda.</p>
            ) : (
              livros.map((livro) => (
                <div key={livro.id} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-black text-center">{livro.titulo}</h3>
                  <p className="text-black mt-4"><strong>Autor:</strong> {livro.autor}</p>
                  <p className="text-black mt-4"><strong>Gênero:</strong> {livro.genero}</p>
                  <p className="text-gray-600 mt-4">{livro.descricao}</p>
                  <div className="mt-6 flex gap-4">
                    <div className="flex-1">
                      <div className="bg-blue-400 p-2 rounded-lg">
                        <button
                          onClick={() => editarLivro(livro.id)}
                          className="text-white hover:text-blue-200 font-medium transition-colors w-full"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-300 p-2 rounded-lg">
                        <button
                          onClick={() => setLivroParaExcluir(livro)}
                          className="text-black hover:text-red-800 font-medium transition-colors w-full"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <form
            onSubmit={salvarLivro}
            className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-black mb-8 text-center">
              {editando ? "Editar Livro" : "Adicionar Novo Livro"}
            </h2>

            <div className="space-y-6">
              <input
                type="text"
                name="titulo"
                placeholder="Título do livro"
                value={livroAtual.titulo}
                onChange={handleChange}
                className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="autor"
                placeholder="Autor do livro"
                value={livroAtual.autor}
                onChange={handleChange}
                className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="genero"
                placeholder="Gênero do livro"
                value={livroAtual.genero}
                onChange={handleChange}
                className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                name="descricao"
                placeholder="Descrição do livro"
                value={livroAtual.descricao}
                onChange={handleChange}
                className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                className="bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
              >
                {editando ? "Atualizar" : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setTela("home")}
                className="bg-gray-300 text-black px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </main>

      {livroParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Realmente deseja excluir?</h2>
            <p className="text-gray-700 text-center mb-6">Tem certeza que deseja excluir o livro <strong>{livroParaExcluir.titulo}</strong>?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setLivroParaExcluir(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => excluirLivro(livroParaExcluir.id)}
                className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
