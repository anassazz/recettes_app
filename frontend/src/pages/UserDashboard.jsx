import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Heart, Clock, Star, Search } from 'lucide-react';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/recipes');
        if (response.ok) {
          const data = await response.json();
          setRecipes(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des recettes:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await fetch(`http://localhost:3000/favorites?userId=${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.map(fav => fav.recipeId));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    };

    fetchRecipes();
    fetchFavorites();
  }, [currentUser.id]);

  const toggleFavorite = async (recipeId) => {
    const isFavorite = favorites.includes(recipeId);
    
    try {
      if (isFavorite) {
        // Supprimer des favoris
        await fetch(`http://localhost:3000/favorites/${recipeId}?userId=${currentUser.id}`, {
          method: 'DELETE',
        });
        setFavorites(favorites.filter(id => id !== recipeId));
      } else {
        // Ajouter aux favoris
        await fetch('http://localhost:3000/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            recipeId,
          }),
        });
        setFavorites([...favorites, recipeId]);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'favorites') {
      return matchesSearch && favorites.includes(recipe.id);
    }
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Bonjour, {currentUser.name} 👋</h1>
          <p className="text-red-100">Découvrez de nouvelles recettes ou consultez vos favoris.</p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Search and Tabs */}
          <div className="mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une recette..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('all')}
              >
                <BookOpen size={16} className="inline mr-1" />
                Toutes les recettes
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'favorites'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('favorites')}
              >
                <Heart size={16} className="inline mr-1" />
                Mes favoris
              </button>
            </div>
          </div>

          {/* Recipes Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement des recettes...</p>
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    {recipe.image && (
                      <img 
                        src={recipe.image} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
                    >
                      <Heart 
                        size={18} 
                        className={favorites.includes(recipe.id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{recipe.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{recipe.prepTime} min</span>
                      </div>
                      <div className="flex items-center">
                        <Star size={14} className="mr-1 text-yellow-400" />
                        <span>{recipe.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeTab === 'favorites' 
                  ? "Vous n'avez pas encore de recettes favorites."
                  : "Aucune recette ne correspond à votre recherche."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;