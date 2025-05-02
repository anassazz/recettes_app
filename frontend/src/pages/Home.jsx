import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight } from 'lucide-react';

const Home = () => {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedRecipes = async () => {
      try {
        const response = await fetch('http://localhost:3000/recipes?featured=true');
        if (response.ok) {
          const data = await response.json();
          setFeaturedRecipes(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des recettes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRecipes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <ChefHat size={64} className="mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bienvenue sur 404 Recettes</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Découvrez des recettes délicieuses et faciles à préparer pour tous les jours.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors"
            >
              S'inscrire
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Recipes */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Recettes à découvrir</h2>
        
        {loading ? (
          <div className="text-center">Chargement des recettes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {recipe.image && (
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
                  <p className="text-gray-600 mb-4">{recipe.description.substring(0, 100)}...</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {recipe.prepTime} min • {recipe.difficulty}
                    </span>
                    <Link 
                      to={`/recipes/${recipe.id}`}
                      className="text-red-600 font-medium flex items-center hover:text-red-700"
                    >
                      Voir la recette
                      <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && featuredRecipes.length === 0 && (
          <div className="text-center text-gray-600">
            Aucune recette à afficher pour le moment.
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Rejoignez notre communauté de cuisiniers</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous pour accéder à toutes nos recettes, sauvegarder vos favorites et partager les vôtres.
          </p>
          <Link
            to="/register"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Créer un compte gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;