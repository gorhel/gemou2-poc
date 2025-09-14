export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bienvenue sur Gémou2 ! 🎲
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            L'application qui connecte les passionnés de jeux de société.
            Organisez des événements, rencontrez des joueurs et échangez vos jeux.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Commencer
            </button>
            <button className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
              En savoir plus
            </button>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Événements</h3>
            <p className="text-gray-600">Créez et rejoignez des soirées jeux près de chez vous</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Communauté</h3>
            <p className="text-gray-600">Échangez avec des passionnés et trouvez des partenaires de jeu</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">Marketplace</h3>
            <p className="text-gray-600">Vendez, achetez et échangez vos jeux de société</p>
          </div>
        </div>
      </div>
    </main>
  );
}