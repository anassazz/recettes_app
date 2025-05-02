import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  Heart, 
  Star, 
  ArrowLeft, 
  ChefHat, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';

const RecipeView = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Fetch recipe details
        const response = await fetch(`http://localhost:3000/recipes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRecipe(data);
        } else {
          // If recipe not found, redirect to 404 page
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la recette:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkFavoriteStatus = async () => {
      if (!currentUser) return;
      
      try {
        const response = await fetch(`http://localhost:3000/favorites?userId=${currentUser.id}&recipeId=${id}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.length > 0);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
      }
    };

    fetchRecipe();
    checkFavoriteStatus();
  }, [id, navigate, currentUser]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      if (isFavorite) {
        // Supprimer des favoris
        await fetch(`http://localhost:3000/favorites/${id}?userId=${currentUser.id}`, {
          method: 'DELETE',
        });
        setIsFavorite(false);
        showNotification('Recette retirée des favoris');
      } else {
        // Ajouter aux favoris
        await fetch('http://localhost:3000/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            recipeId: id,
          }),
        });
        setIsFavorite(true);
        showNotification('Recette ajoutée aux favoris');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      showNotification('Une erreur est survenue', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat size={48} className="mx-auto mb-4 text-red-600 animate-pulse" />
          <p className="text-gray-600">Chargement de la recette...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
          notification.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'error' ? (
              <AlertCircle size={20} className="mr-2" />
            ) : (
              <CheckCircle size={20} className="mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Recipe Hero */}
      <div className="w-full h-64 md:h-96 bg-gray-200 relative">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={64} className="text-gray-400" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center text-white/80 hover:text-white"
            >
              <ArrowLeft size={20} className="mr-1" />
              Retour
            </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{recipe.prepTime} min</span>
              </div>
              <div className="flex items-center">
                <span className="px-2 py-1 bg-white/20 rounded-md text-sm">{recipe.difficulty}</span>
              </div>
              <div className="flex items-center">
                <Star size={16} className="mr-1 text-yellow-400" />
                <span>{recipe.rating}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">À propos de la recette</h2>
            <button
              onClick={toggleFavorite}
              className="flex items-center space-x-1 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"} />
              <span>{isFavorite ? 'Retiré des favoris' : 'Ajouter aux favoris'}</span>
            </button>
          </div>

          <p className="text-gray-600 mb-8">{recipe.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Ingrédients</h3>
              <ul className="space-y-2">
                {Array.isArray(recipe.ingredients) ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-2 mr-2"></span>
                      <span>{ingredient}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Aucun ingrédient disponible</li>
                )}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Instructions</h3>
              <ol className="space-y-4">
                {Array.isArray(recipe.instructions) ? (
                  recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Aucune instruction disponible</li>
                )}
              </ol>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
            <h3 className="font-semibold text-gray-800 mb-2">Astuces du chef</h3>
            <p className="text-gray-600">
              Cette recette se conserve jusqu'à 3 jours au réfrigérateur dans un contenant hermétique. 
              Vous pouvez remplacer certains ingrédients selon vos préférences ou restrictions alimentaires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeView;